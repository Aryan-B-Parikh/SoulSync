/**
 * Streaming Controller (Prisma Refactor)
 * Handles Server-Sent Events (SSE) for real-time AI responses
 */

const prisma = require('../config/prisma');
const { generateStreamingResponse } = require('../services/aiService');
const { generateEmbedding, storeMemory, retrieveRelevantMemories } = require('../services/vectorService');
const { analyzeSentiment } = require('../services/sentiment/sentimentService');
// Note: Uses Node 18+ built-in fetch (no node-fetch required)

// Mood label → numeric score for deviation calculation
const MOOD_SCORES = {
    very_positive: 1.0,
    positive: 0.5,
    neutral: 0.0,
    negative: -0.5,
    very_negative: -1.0,
};

/**
 * Get LLM sentiment classification as a second opinion.
 * Returns mood string or null on failure.
 */
async function getLLMSentiment(userMessage, groqApiKey) {
    if (!groqApiKey) return null;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a sentiment classifier. Classify the emotional state of the user message. Respond ONLY with valid JSON in this exact format: {"mood": "neutral"}. Mood must be one of: very_positive, positive, neutral, negative, very_negative.'
                    },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 20,
                temperature: 0.1,
            }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim();
        const parsed = JSON.parse(raw);
        return parsed.mood || null;
    } catch {
        return null; // Never break chat flow for sentiment
    }
}

/**
 * Stream AI response for a chat message
 * Uses Server-Sent Events (SSE) to send chunks in real-time
 */
async function streamMessage(req, res, next) {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        // Verify chat ownership
        const chat = await prisma.chat.findFirst({
            where: { id: chatId, userId: req.user.userId }
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Get user's personality preference
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { personality: true }
        });
        const personality = user?.personality || 'reflective';

        // Analyze sentiment of user message
        const sentimentData = analyzeSentiment(content);

        // Save user message with sentiment data (flattened schema)
        const userMessage = await prisma.message.create({
            data: {
                chatId,
                role: 'user',
                content,
                sentimentScore: sentimentData.score,
                sentimentComparative: sentimentData.comparative,
                sentimentMood: sentimentData.mood,
                sentimentConfidence: sentimentData.confidence
            }
        });

        // Generate and store embedding for memory (async, don't block streaming)
        try {
            const embedding = await generateEmbedding(content);
            const vectorId = await storeMemory(
                userMessage.id,
                req.user.userId,
                chatId,
                content,
                embedding,
                'user'
            );
            await prisma.message.update({
                where: { id: userMessage.id },
                data: { vectorId }
            });
        } catch (embeddingError) {
            console.warn('Failed to store memory embedding:', embeddingError);
            // Continue without memory - don't break chat flow
        }

        // Retrieve relevant memories for context
        let memories = [];
        try {
            memories = await retrieveRelevantMemories(req.user.userId, content, 3);
            console.log(`📚 Retrieved ${memories.length} relevant memories`);
        } catch (memoryError) {
            console.warn('Failed to retrieve memories:', memoryError);
            // Continue without memories - don't break chat flow
        }

        // Get chat history
        const history = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            take: 20,
            select: {
                role: true,
                content: true
            }
        });

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

        // Get API configuration
        const config = {
            groqApiKey: process.env.GROQ_API_KEY,
            huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
        };

        let fullResponse = '';
        let assistantMessage = null;

        try {
            // Stream AI response with user's personality and memories
            const stream = generateStreamingResponse(history, config, personality, memories);

            for await (const chunk of stream) {
                fullResponse += chunk;

                // Send chunk to client via SSE
                res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
            }

            // Save complete assistant message to database
            // Include retrieved RAG memories in metadata + context_used (IDs only) for training data
            assistantMessage = await prisma.message.create({
                data: {
                    chatId,
                    role: 'assistant',
                    content: fullResponse,
                    metadata: memories.length > 0 ? {
                        retrievedMemories: memories.map(m => ({
                            content: m.content,
                            score: m.score,
                            timestamp: m.timestamp,
                        }))
                    } : undefined,
                    context_used: memories.length > 0 ? {
                        memoryIds: memories.map(m => m.messageId),
                        count: memories.length,
                        retrievedAt: new Date().toISOString(),
                    } : null,
                }
            });

            // Auto-title chat logic
            if (chat.title === 'New Conversation') {
                await prisma.chat.update({
                    where: { id: chatId },
                    data: {
                        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                        updatedAt: new Date(),
                    }
                });
            } else {
                await prisma.chat.update({
                    where: { id: chatId },
                    data: { updatedAt: new Date() }
                });
            }

            // Send completion event with message IDs
            // Refetch chat title just in case it updated
            const finalChat = await prisma.chat.findUnique({
                where: { id: chatId },
                select: { title: true }
            });

            res.write(`data: ${JSON.stringify({
                done: true,
                userMessageId: userMessage.id,
                assistantMessageId: assistantMessage.id,
                chatTitle: finalChat?.title || chat.title
            })}\n\n`);

        } catch (streamError) {
            console.error('Streaming error:', streamError);
            res.write(`data: ${JSON.stringify({
                error: 'Failed to generate response',
                done: true
            })}\n\n`);
        }

        // ✅ Close the SSE connection FIRST — user sees completion immediately
        res.end();

        // 🔥 Fire-and-forget: LLM hybrid sentiment runs AFTER response is sent
        // This prevents the ~400-800ms Groq call from blocking the done event
        if (userMessage?.id && sentimentData) {
            getLLMSentiment(content, process.env.GROQ_API_KEY)
                .then(llmMood => {
                    if (!llmMood) return;
                    const lexiconScore = MOOD_SCORES[sentimentData.mood] ?? 0;
                    const llmScore = MOOD_SCORES[llmMood] ?? 0;
                    const deviation = Math.abs(lexiconScore - llmScore);
                    if (deviation > 0.2) {
                        console.warn(`⚠️  Sentiment deviation ${deviation.toFixed(2)} on msg ${userMessage.id} — flagged for review`);
                    }
                    return prisma.message.update({
                        where: { id: userMessage.id },
                        data: { sentimentLLM: llmMood, sentimentDeviation: deviation },
                    });
                })
                .catch(err => console.warn('LLM sentiment (background) failed:', err.message));
        }

    } catch (error) {
        console.error('Stream message error:', error);

        // If headers not sent yet, send JSON error
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to process message' });
        }

        // Otherwise send SSE error event
        res.write(`data: ${JSON.stringify({
            error: error.message,
            done: true
        })}\n\n`);
        res.end();
    }
}

module.exports = {
    streamMessage,
};

/**
 * Streaming Controller (Prisma Refactor)
 * Handles Server-Sent Events (SSE) for real-time AI responses
 */

const prisma = require('../config/prisma');
const { generateStreamingResponse } = require('../services/aiService');
const { generateEmbedding, storeMemory, retrieveRelevantMemories } = require('../services/vectorService');
const { analyzeSentiment } = require('../services/sentiment/sentimentService');

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
            // Include retrieved RAG memories in metadata for training data collection
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

        res.end();

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

/**
 * Streaming Controller
 * Handles Server-Sent Events (SSE) for real-time AI responses
 */

const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const { generateStreamingResponse } = require('../services/aiService');
const { generateEmbedding, storeMemory, retrieveRelevantMemories } = require('../services/vectorService');

/**
 * Stream AI response for a chat message
 * Uses Server-Sent Events (SSE) to send chunks in real-time
 */
async function streamMessage(req, res, next) {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        // Verify chat ownership
        const chat = await Chat.findOne({ _id: chatId, userId: req.user.userId });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Get user's personality preference
        const user = await User.findById(req.user.userId);
        const personality = user?.personality || 'reflective';

        // Save user message
        const userMessage = await Message.create({
            chatId,
            role: 'user',
            content,
        });

        // Generate and store embedding for memory (async, don't block streaming)
        try {
            const embedding = await generateEmbedding(content);
            const vectorId = await storeMemory(
                userMessage._id.toString(),
                req.user.userId,
                chatId,
                content,
                embedding,
                'user'
            );
            userMessage.vectorId = vectorId;
            await userMessage.save();
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
        const history = await Message.find({ chatId })
            .sort({ createdAt: 1 })
            .limit(20)
            .select('role content -_id');

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
            assistantMessage = await Message.create({
                chatId,
                role: 'assistant',
                content: fullResponse,
            });

            // Auto-title chat if it's the first message
            if (chat.title === 'New Conversation') {
                chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
                await chat.save();
            } else {
                // Update chat timestamp
                chat.updatedAt = new Date();
                await chat.save();
            }

            // Send completion event with message IDs
            res.write(`data: ${JSON.stringify({
                done: true,
                userMessageId: userMessage._id,
                assistantMessageId: assistantMessage._id,
                chatTitle: chat.title
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

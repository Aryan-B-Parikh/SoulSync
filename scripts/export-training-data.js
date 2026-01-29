/**
 * Export Training Data Script
 * Exports messages with positive feedback as JSONL for fine-tuning
 * 
 * Usage: npm run export-data
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Message = require('../server/models/message.model');
const Chat = require('../server/models/chat.model');

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

/**
 * Export training data to JSONL format
 */
async function exportTrainingData() {
    try {
        console.log('📊 Fetching messages with positive feedback...');

        // Get all messages with upvotes
        const upvotedMessages = await Message.find({ feedback: 'up' })
            .sort({ createdAt: 1 })
            .lean();

        console.log(`Found ${upvotedMessages.length} upvoted messages`);

        if (upvotedMessages.length === 0) {
            console.log('⚠️  No upvoted messages found. Exiting.');
            return;
        }

        // Group messages by chat to get conversation context
        const chatIds = [...new Set(upvotedMessages.map(m => m.chatId.toString()))];
        console.log(`Processing ${chatIds.length} unique chats...`);

        const trainingExamples = [];

        for (const chatId of chatIds) {
            // Get all messages from this chat
            const chatMessages = await Message.find({ chatId })
                .sort({ createdAt: 1 })
                .lean();

            // Find upvoted assistant messages
            const upvotedInChat = chatMessages.filter(
                m => m.feedback === 'up' && m.role === 'assistant'
            );

            for (const upvotedMsg of upvotedInChat) {
                // Get conversation history up to this message
                const msgIndex = chatMessages.findIndex(m => m._id.toString() === upvotedMsg._id.toString());
                const history = chatMessages.slice(0, msgIndex + 1);

                // Format as OpenAI fine-tuning format
                const messages = history.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content,
                }));

                // Only include if there's at least one user message
                if (messages.some(m => m.role === 'user')) {
                    trainingExamples.push({ messages });
                }
            }
        }

        console.log(`Generated ${trainingExamples.length} training examples`);

        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = path.join(dataDir, `training-data-${timestamp}.jsonl`);

        // Write JSONL file (one JSON object per line)
        const jsonlContent = trainingExamples
            .map(example => JSON.stringify(example))
            .join('\n');

        fs.writeFileSync(filename, jsonlContent, 'utf8');

        console.log(`✅ Exported ${trainingExamples.length} examples to: ${filename}`);
        console.log('\n📝 File format: JSONL (JSON Lines)');
        console.log('🔧 Compatible with: OpenAI fine-tuning, Groq fine-tuning');
        console.log('\nNext steps:');
        console.log('1. Review the exported file');
        console.log('2. Upload to OpenAI/Groq for fine-tuning');
        console.log('3. Train custom model with your data');

    } catch (error) {
        console.error('❌ Export error:', error);
        throw error;
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        await connectDB();
        await exportTrainingData();
        console.log('\n✅ Export completed successfully');
    } catch (error) {
        console.error('\n❌ Export failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
main();

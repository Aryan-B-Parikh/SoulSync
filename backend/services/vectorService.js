/**
 * Vector Service
 * Handles vector database operations for RAG-based memory
 * Uses Pinecone for vector storage and Transformers.js (Local) for embeddings
 */

const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize clients
let pinecone = null;
let pineconeIndex = null;
let embeddingPipeline = null;

// Lazy load transformers to avoid startup delay if not needed immediately
let pipeline = null;

/**
 * Initialize Pinecone client and Local Embedding Model
 */
async function initializePinecone() {
    if (pinecone && embeddingPipeline) return; // Already initialized

    try {
        console.log('🔌 Initializing Vector Service...');

        // 1. Initialize Local Embedding Model
        if (!embeddingPipeline) {
            console.log('🤖 Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
            // Lazy import for ESM compatibility
            const { pipeline: transformerPipeline } = await import('@xenova/transformers');

            // Using a quantized model by default which is small (~22MB)
            embeddingPipeline = await transformerPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('✅ Local embedding model loaded');
        }

        // 2. Initialize Pinecone
        if (!pinecone) {
            pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY,
            });

            const indexName = process.env.PINECONE_INDEX_NAME || 'soulsync-memories';

            try {
                // Check if index exists by describing it
                await pinecone.describeIndex(indexName);
                pineconeIndex = pinecone.index(indexName);
                console.log(`✅ Connected to Pinecone index: ${indexName}`);
            } catch (error) {
                console.log(`📝 Index ${indexName} not found (or error), creating...`);

                // Create index if it doesn't exist
                await pinecone.createIndex({
                    name: indexName,
                    dimension: 384, // Important: MiniLM-L6-v2 dimension is 384
                    metric: 'cosine',
                    spec: {
                        serverless: {
                            cloud: 'aws',
                            region: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
                        },
                    },
                });

                // Wait for index to be ready
                console.log('⏳ Waiting for index initialization...');
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
                pineconeIndex = pinecone.index(indexName);
                console.log(`✅ Created Pinecone index: ${indexName}`);
            }
        }

        console.log('✅ Vector service initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize vector service:', error);
        throw error;
    }
}

/**
 * Generate embedding for text using Local Transformer
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
    try {
        if (!embeddingPipeline) await initializePinecone();

        // Generate embedding
        // pooling: 'mean' and normalize: true are recommended for sentence similarity
        const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });

        // Convert Tensor to standard Array
        return Array.from(output.data);
    } catch (error) {
        console.error('Failed to generate embedding:', error);
        throw error;
    }
}

/**
 * Store message in vector database
 * @param {string} messageId - MongoDB message ID
 * @param {string} userId - User ID
 * @param {string} chatId - Chat ID
 * @param {string} content - Message content
 * @param {number[]} embedding - Embedding vector
 * @param {string} role - Message role (user/assistant)
 * @returns {Promise<string>} - Vector ID
 */
async function storeMemory(messageId, userId, chatId, content, embedding, role) {
    try {
        if (!pineconeIndex) await initializePinecone();

        const vectorId = `${userId}-${messageId}`;

        await pineconeIndex.upsert([
            {
                id: vectorId,
                values: embedding,
                metadata: {
                    messageId,
                    userId,
                    chatId,
                    content: content.substring(0, 1000), // Limit content length
                    role,
                    timestamp: new Date().toISOString(),
                },
            },
        ]);

        return vectorId;
    } catch (error) {
        console.error('Failed to store memory:', error);
        throw error;
    }
}

/**
 * Retrieve relevant memories for a query
 * @param {string} userId - User ID
 * @param {string} query - Query text
 * @param {number} topK - Number of memories to retrieve
 * @returns {Promise<Array>} - Array of relevant memories
 */
async function retrieveRelevantMemories(userId, query, topK = 3) {
    try {
        if (!pineconeIndex) await initializePinecone();

        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Query Pinecone with user filter
        const queryResponse = await pineconeIndex.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            filter: {
                userId: { $eq: userId },
            },
        });

        // Format results
        const memories = queryResponse.matches.map((match) => ({
            messageId: match.metadata.messageId,
            content: match.metadata.content,
            role: match.metadata.role,
            timestamp: match.metadata.timestamp,
            score: match.score,
        }));

        return memories;
    } catch (error) {
        console.error('Failed to retrieve memories:', error);
        return []; // Return empty array on error to not break chat flow
    }
}

/**
 * Delete all memories for a user (privacy/GDPR)
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of deleted vectors
 */
async function deleteUserMemories(userId) {
    try {
        if (!pineconeIndex) await initializePinecone();
        console.warn('Delete user memories not fully implemented - requires tracking vector IDs');
        return 0;
    } catch (error) {
        console.error('Failed to delete user memories:', error);
        throw error;
    }
}

/**
 * Get memory statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Memory stats
 */
async function getMemoryStats(userId) {
    try {
        if (!pineconeIndex) await initializePinecone();

        // Query to get total count (approximate)
        // Note: For MiniLM-L6-v2, dimension is 384
        const statsResponse = await pineconeIndex.query({
            vector: new Array(384).fill(0), // Dummy vector (size 384)
            topK: 10000,
            includeMetadata: true,
            filter: {
                userId: { $eq: userId },
            },
        });

        const memories = statsResponse.matches;

        if (memories.length === 0) {
            return {
                totalMemories: 0,
                oldestMemory: null,
                newestMemory: null,
            };
        }

        const timestamps = memories.map(m => new Date(m.metadata.timestamp));

        return {
            totalMemories: memories.length,
            oldestMemory: new Date(Math.min(...timestamps)).toISOString(),
            newestMemory: new Date(Math.max(...timestamps)).toISOString(),
        };
    } catch (error) {
        console.error('Failed to get memory stats:', error);
        return {
            totalMemories: 0,
            oldestMemory: null,
            newestMemory: null,
        };
    }
}

module.exports = {
    initializePinecone,
    generateEmbedding,
    storeMemory,
    retrieveRelevantMemories,
    deleteUserMemories,
    getMemoryStats,
};

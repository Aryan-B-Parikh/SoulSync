const { Pinecone } = require('@pinecone-database/pinecone');
// const { pipeline } = require('@xenova/transformers'); // EMS Error
const path = require('path');
const dotenv = require('dotenv');

// Load environment from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verify() {
    console.log('🔍 Verifying Embedding Configuration...');

    try {
        // 1. Generate Local Embedding
        console.log('📦 Loading local model (MiniLM-L6-v2)...');
        // Dynamic import
        const { pipeline } = await import('@xenova/transformers');
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const output = await extractor('Test sentence', { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        console.log(`✅ Generated Local Embedding. Dimension: ${embedding.length}`);

        if (embedding.length !== 384) {
            console.error('❌ Unexpected embedding dimension! Expected 384.');
            return;
        }

        // 2. Check Pinecone Index
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const indexName = process.env.PINECONE_INDEX_NAME || 'soulsync-memories';

        console.log(`🌲 Checking Pinecone Index '${indexName}'...`);
        const desc = await pc.describeIndex(indexName);
        console.log(`   Status: ${desc.status.state}`);
        console.log(`   Dimension: ${desc.dimension}`);

        if (desc.dimension !== 384) {
            console.error(`\n❌ DIMENSION MISMATCH!`);
            console.error(`Local Model: 384`);
            console.error(`Pinecone Index: ${desc.dimension}`);
            console.error(`\nACTION REQUIRED: You must DELETE the index '${indexName}' in Pinecone Console or via script so it can be recreated with dimension 384.`);
            // Optional: Ask to delete? (Not interactive here)
        } else {
            console.log(`✅ Dimensions match! RAG system is ready.`);
        }

    } catch (error) {
        console.error('❌ Verification Error:', error);
        if (error.status === 404) {
            console.log(`   Index '${process.env.PINECONE_INDEX_NAME || 'soulsync-memories'}' does not exist. It will be auto-created correctly.`);
        }
    }
}

verify();

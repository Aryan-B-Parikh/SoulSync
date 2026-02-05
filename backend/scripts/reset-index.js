const { Pinecone } = require('@pinecone-database/pinecone');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function resetIndex() {
    console.log('🗑️  Resetting Pinecone Index...');
    const indexName = process.env.PINECONE_INDEX_NAME || 'soulsync-memories';
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    try {
        console.log(`   Deleting index '${indexName}'...`);
        await pc.deleteIndex(indexName);
        console.log(`   ✅ Index deleted. Server will recreate it with correct dimension (384) on startup.`);
    } catch (error) {
        if (error.status === 404) {
            console.log(`   Index '${indexName}' already deleted.`);
        } else {
            console.error('   ❌ Delete failed:', error.message);
        }
    }
}

resetIndex();

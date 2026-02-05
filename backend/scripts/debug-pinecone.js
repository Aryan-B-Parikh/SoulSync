require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function debugPinecone() {
    console.log('--- Pinecone Debugger ---');
    console.log(`API Key Length: ${process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY.length : 'MISSING'}`);
    console.log(`Target Index: ${process.env.PINECONE_INDEX_NAME}`);
    console.log(`Environment: ${process.env.PINECONE_ENVIRONMENT}`);

    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });

        console.log('Fetching index list...');
        const indexes = await pinecone.listIndexes();
        console.log('Existing Indexes:', JSON.stringify(indexes, null, 2));

        const targetIndex = process.env.PINECONE_INDEX_NAME || 'soulsync-memories';
        const exists = indexes.indexes?.find(i => i.name === targetIndex);

        if (exists) {
            console.log(`✅ Index '${targetIndex}' EXISTS.`);
            console.log(`- Status: ${exists.status}`);
            console.log(`- Dimension: ${exists.dimension}`);
            console.log(`- Host: ${exists.host}`);
        } else {
            console.error(`❌ Index '${targetIndex}' does NOT exist.`);
            console.log('Attempting creation...');
            await pinecone.createIndex({
                name: targetIndex,
                dimension: 384,
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
                    },
                },
            });
            console.log('Creation command sent. Waiting...');
            await new Promise(r => setTimeout(r, 10000));
            const newIndexes = await pinecone.listIndexes();
            console.log('Updated Indexes:', JSON.stringify(newIndexes, null, 2));
        }

    } catch (error) {
        console.error('CRITICAL PINECONE ERROR:', error);
    }
}

debugPinecone();

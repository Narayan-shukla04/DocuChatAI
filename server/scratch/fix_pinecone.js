require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function fixIndex() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'rag-project';

    console.log(`Checking if index ${indexName} exists...`);
    const { indexes } = await pc.listIndexes();
    const indexExists = indexes && indexes.some(idx => idx.name === indexName);

    if (indexExists) {
      console.log(`Deleting existing index ${indexName}...`);
      await pc.deleteIndex(indexName);
      console.log(`Successfully deleted ${indexName}. Waiting a moment...`);
      await new Promise(r => setTimeout(r, 5000));
    }

    console.log(`Creating new index ${indexName} with dimension 768...`);
    await pc.createIndex({
      name: indexName,
      dimension: 768,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    console.log(`Successfully created index ${indexName} with 768 dimensions!`);
  } catch (error) {
    console.error('Error fixing Pinecone index:', error);
  }
  process.exit(0);
}

fixIndex();

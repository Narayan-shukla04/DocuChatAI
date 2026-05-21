require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function test() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'rag-project';
    const index = pc.index(indexName);

    console.log("Querying...");
    const results = await index.query({
      vector: Array(768).fill(0.1),
      topK: 5,
      filter: { test: true },
      includeMetadata: true
    });
    console.log("Query success! Matches:", results.matches.length);
  } catch(e) {
    console.error("Error querying:", e);
  }
}
test();

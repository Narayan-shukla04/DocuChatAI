require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function test() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'rag-project';
    const index = pc.index(indexName);

    console.log("Upserting test record...");
    await index.upsert(
      {
        records: [
          {
            id: "test-id",
            values: Array(768).fill(0.1),
            metadata: { test: true }
          }
        ]
      }
    );
    console.log("Upsert success!");
  } catch(e) {
    console.error("Error upserting:", e);
  }
}
test();

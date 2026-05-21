require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function test() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'rag-project';
    const index = pc.index(indexName);

    console.log("Deleting...");
    await index.deleteMany({ filter: { docId: 'test-id' } });
    console.log("Delete success!");
  } catch(e) {
    console.error("Error deleting:", e);
  }
}
test();

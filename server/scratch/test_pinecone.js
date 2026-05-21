require('dotenv').config();
const { getPineconeClient } = require('../services/pineconeService');

async function test() {
  const client = getPineconeClient();
  const indexInfo = await client.describeIndex(process.env.PINECONE_INDEX);
  console.log(indexInfo);
}

test().catch(console.error);

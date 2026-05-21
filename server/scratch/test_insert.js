require('dotenv').config();
const { PineconeStore } = require('@langchain/pinecone');
const { getEmbeddingsModel } = require('../services/embeddingService');
const { getPineconeIndex } = require('../services/pineconeService');
const { Document } = require('@langchain/core/documents');

async function test() {
  try {
    const embeddings = getEmbeddingsModel();
    const pineconeIndex = getPineconeIndex();
    
    const docs = [new Document({ pageContent: "hello world", metadata: { test: "true" } })];
    
    console.log("Trying fromDocuments...");
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 1
    });
    console.log("Success!");
  } catch (error) {
    console.error("Caught error:", error.message, error);
  }
  process.exit(0);
}
test();

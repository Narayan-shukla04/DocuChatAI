const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { Document } = require('langchain/document');
require('dotenv').config();

async function testFilter() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
  });
  
  const vectorStore = new MemoryVectorStore(embeddings);
  
  const docs = [
    new Document({ pageContent: "This is a secret document about alien tech.", metadata: { docId: "123" } }),
    new Document({ pageContent: "This is a public document about cats.", metadata: { docId: "456" } })
  ];
  
  await vectorStore.addDocuments(docs);
  
  const retriever = vectorStore.asRetriever({
    k: 5,
    filter: (doc) => doc.metadata.docId === "123",
  });
  
  const results = await retriever.getRelevantDocuments("What is the document about?");
  console.log("Retrieved for 123:", results.map(r => r.pageContent));
}

testFilter();

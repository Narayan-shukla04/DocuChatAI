const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { getPineconeIndex } = require('./pineconeService');

let embeddingsModel = null;

/**
 * Get the Google Generative AI Embeddings model as a singleton
 */
const getEmbeddingsModel = () => {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-embedding-001",
      maxRetries: 3
    });
  }
  return embeddingsModel;
};

/**
 * Store documents/text chunks in Pinecone
 */
const storeVectorsInPinecone = async (docs) => {
  const embeddings = getEmbeddingsModel();
  const pineconeIndex = getPineconeIndex();

  const batchSize = 100;
  const maxRetries = 3;

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    let attempts = 0;
    let success = false;

    while (attempts < maxRetries && !success) {
      try {
        const texts = batch.map(d => d.pageContent);
        // Generate embeddings for the batch
        const vectors = await embeddings.embedDocuments(texts);
        
        const records = batch.map((doc, idx) => {
          const sanitizedMeta = { ...doc.metadata };
          // Remove complex nested objects that Pinecone rejects
          if (sanitizedMeta.loc) delete sanitizedMeta.loc;
          
          return {
            id: `${doc.metadata.docId}-${idx}-${Date.now()}`, // Unique ID for each chunk
            values: vectors[idx],
            metadata: { text: doc.pageContent, ...sanitizedMeta }
          };
        });

        // Upsert explicitly using { records: [...] } as required by Pinecone SDK v7
        await pineconeIndex.upsert({ records });
        success = true;
      } catch (error) {
        attempts++;
        console.warn(`Pinecone batch insertion failed (Attempt ${attempts}/${maxRetries}): ${error.message}`);
        if (attempts >= maxRetries) {
          throw new Error(`Failed to upload to Pinecone after ${maxRetries} attempts: ${error.message}`);
        }
        await delay(2000 * attempts); // Exponential backoff
      }
    }
  }
};

/**
 * Get a Pinecone Vector Store instance connected to our index
 */
const getVectorStore = async () => {
  const embeddings = getEmbeddingsModel();
  const pineconeIndex = getPineconeIndex();

  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });
};

module.exports = {
  getEmbeddingsModel,
  storeVectorsInPinecone,
  getVectorStore
};

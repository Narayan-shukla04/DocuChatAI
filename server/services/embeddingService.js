const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { PineconeStore } = require('@langchain/pinecone');
const { getPineconeIndex } = require('./pineconeService');

let embeddingsModel = null;

const getEmbeddingsModel = () => {
  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-embedding-001',
      maxRetries: 3,
    });
  }
  return embeddingsModel;
};

const storeVectorsInPinecone = async (docs) => {
  const embeddings = getEmbeddingsModel();
  const pineconeIndex = getPineconeIndex();
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < docs.length; i += 100) {
    const batch = docs.slice(i, i + 100);
    let attempts = 0;
    while (attempts < 3) {
      try {
        const vectors = await embeddings.embedDocuments(batch.map((d) => d.pageContent));
        const records = batch.map((doc, idx) => {
          const meta = { ...doc.metadata };
          delete meta.loc;
          return { id: `${meta.docId}-${idx}-${Date.now()}`, values: vectors[idx], metadata: { text: doc.pageContent, ...meta } };
        });
        await pineconeIndex.upsert({ records });
        break;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw new Error(`Pinecone upsert failed after 3 attempts: ${error.message}`);
        await delay(2000 * attempts);
      }
    }
  }
};

const getVectorStore = async () =>
  PineconeStore.fromExistingIndex(getEmbeddingsModel(), { pineconeIndex: getPineconeIndex() });

module.exports = { getEmbeddingsModel, storeVectorsInPinecone, getVectorStore };

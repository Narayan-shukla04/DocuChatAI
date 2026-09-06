const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;
let pineconeIndex = null;

const getPineconeClient = () => {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY is missing');
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pineconeClient;
};

const getPineconeIndex = () => {
  if (!pineconeIndex) pineconeIndex = getPineconeClient().index(process.env.PINECONE_INDEX || 'rag-project');
  return pineconeIndex;
};

const deleteVectorsByDocId = async (docId) => {
  try {
    await getPineconeIndex().deleteMany({ filter: { docId: String(docId) } });
  } catch (error) {
    throw new Error(`Pinecone deletion failed: ${error.message}`);
  }
};

module.exports = { getPineconeClient, getPineconeIndex, deleteVectorsByDocId };

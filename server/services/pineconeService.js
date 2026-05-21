const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;
let pineconeIndex = null;

/**
 * Initialize Pinecone client as a singleton
 */
const getPineconeClient = () => {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is missing from environment variables');
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }
  return pineconeClient;
};

/**
 * Get the initialized Pinecone index
 */
const getPineconeIndex = () => {
  if (!pineconeIndex) {
    const client = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX || 'rag-project';
    pineconeIndex = client.index(indexName); // Use lowercase .index() for v7
  }
  return pineconeIndex;
};

/**
 * Delete vectors associated with a specific document ID
 */
const deleteVectorsByDocId = async (docId) => {
  try {
    const index = getPineconeIndex();
    await index.deleteMany({ filter: { docId: String(docId) } }); // Pinecone v7 syntax requires nested filter object
    console.log(`Successfully deleted vectors for document ${docId} from Pinecone.`);
  } catch (error) {
    console.error(`Failed to delete vectors for document ${docId}:`, error.message);
    throw new Error(`Pinecone deletion failed: ${error.message}`);
  }
};

module.exports = {
  getPineconeClient,
  getPineconeIndex,
  deleteVectorsByDocId
};

require('dotenv').config();
const { getEmbeddingsModel } = require('../services/embeddingService');

async function test() {
  console.log('Testing embeddings...');
  const embeddings = getEmbeddingsModel();
  
    const vectors = await embeddings.embedDocuments(["hello", "world"]);
    console.log('Vectors array length:', vectors.length);
    if(vectors.length > 0) {
      console.log('First vector length:', vectors[0].length);
    }
  
  console.log('Done');
  process.exit(0);
}

test().catch(console.error);

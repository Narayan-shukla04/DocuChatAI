require('dotenv').config();
const { processDocument } = require('../rag/pipeline');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const docId = new mongoose.Types.ObjectId();
  console.log('Testing processDocument with id:', docId);
  
  await processDocument(docId, 'uploads/file-1779338260168-327189319.pdf', 'application/pdf', 'test.pdf');
  
  console.log('Done');
  process.exit(0);
}

test().catch(console.error);

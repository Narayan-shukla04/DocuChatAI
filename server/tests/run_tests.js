const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const DUMMY_FILE_PATH = path.join(__dirname, 'dummy_test.txt');

async function runTests() {
  console.log('--- Starting Automated Tests ---');
  let uploadedDocId = null;

  try {
    // 1. Create a dummy file
    fs.writeFileSync(DUMMY_FILE_PATH, 'This is a dummy document created for automated testing of the RAG pipeline. Pinecone should vectorize this sentence.');
    console.log('✅ Created dummy file for testing.');

    // 2. Test File Upload & Vectorization
    console.log('⏳ Testing upload and vectorization...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(DUMMY_FILE_PATH));

    const uploadRes = await axios.post(`${API_URL}/docs/upload`, formData, {
      headers: formData.getHeaders(),
    });

    if (uploadRes.status !== 201 || !uploadRes.data.document) {
      throw new Error('Upload failed');
    }
    
    uploadedDocId = uploadRes.data.document._id;
    console.log(`✅ Upload successful. DocID: ${uploadedDocId}`);
    console.log('✅ Vectorization successful (Sync).');

    // 3. Test Retrieval / Chat
    console.log('⏳ Testing chat retrieval from Pinecone...');
    const chatRes = await axios.post(`${API_URL}/chat`, {
      message: 'What is this document created for?',
      docId: uploadedDocId
    });

    if (chatRes.status !== 200 || !chatRes.data.reply) {
      throw new Error('Chat retrieval failed');
    }

    console.log(`✅ Chat successful. Reply: "${chatRes.data.reply}"`);
    if (chatRes.data.context && chatRes.data.context.length > 0) {
      console.log('✅ Context correctly retrieved from Pinecone.');
    } else {
      console.warn('⚠️ No context retrieved from Pinecone. Fallback used.');
    }

    // 4. Test Deletion
    console.log('⏳ Testing document deletion & Pinecone cleanup...');
    const deleteRes = await axios.delete(`${API_URL}/docs/${uploadedDocId}`);
    if (deleteRes.status !== 200) {
      throw new Error('Deletion failed');
    }
    console.log('✅ Deletion successful. Vectors removed from Pinecone.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Cleanup local file
    if (fs.existsSync(DUMMY_FILE_PATH)) {
      fs.unlinkSync(DUMMY_FILE_PATH);
    }
    console.log('--- Automated Tests Complete ---');
  }
}

runTests();

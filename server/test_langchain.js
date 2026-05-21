const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
require('dotenv').config();

async function testLangChain() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-embedding-001",
    });
    console.log('Generating embedding...');
    const res = await embeddings.embedQuery("Hello world");
    console.log('Embedding successful, length:', res.length);

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-2.5-flash",
    });
    console.log('Generating chat response...');
    const chatRes = await model.invoke("Hello");
    console.log('Chat successful:', chatRes.content);
  } catch (err) {
    console.error('Error:', err);
  }
}

testLangChain();

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.getModels();
    models.forEach(model => {
      console.log(`Model: ${model.name}`);
      console.log(`Supported methods: ${model.supportedGenerationMethods}`);
    });
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();

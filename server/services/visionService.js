const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const generateImageDescription = async (imageBuffer, mimeType) => {
  try {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.5-flash',
      maxOutputTokens: 1024,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await model.invoke([
      { type: 'text', text: 'Analyze this image in extreme detail. Describe all visible elements, text, structures, data representations, and overall context. Return only the descriptive text.' },
      { type: 'image_url', image_url: `data:${mimeType};base64,${imageBuffer.toString('base64')}` },
    ]);

    return response.content;
  } catch (error) {
    throw new Error(`Gemini Vision failed: ${error.message}`);
  }
};

module.exports = { generateImageDescription };

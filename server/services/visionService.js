const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const fs = require('fs');

/**
 * Generate a detailed textual description of an image using Gemini Vision
 * 
 * @param {Buffer} imageBuffer - Buffer of the uploaded image file
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<string>} - Detailed text description of the image
 */
const generateImageDescription = async (imageBuffer, mimeType) => {
  try {
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.5-flash',
      maxOutputTokens: 1024,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analyze this image in extreme detail. Describe all visible elements, text, structures, data representations (like charts or graphs), and the overall context. Make the description as comprehensive as possible so that someone searching for contents of this image can find it using text search. Return only the descriptive text.`;

    const response = await model.invoke([
      { type: "text", text: prompt },
      { 
        type: "image_url", 
        image_url: `data:${mimeType};base64,${base64Image}` 
      }
    ]);

    return response.content;
  } catch (error) {
    console.error('Vision API Error:', error);
    throw new Error(`Failed to process image with Gemini Vision: ${error.message}`);
  }
};

module.exports = {
  generateImageDescription
};

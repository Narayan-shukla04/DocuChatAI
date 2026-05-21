require('dotenv').config();

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    if (data.models) {
      const genModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
      console.log('Available generation models:');
      genModels.forEach(m => console.log(m.name));
    } else {
      console.log('Error:', data);
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();

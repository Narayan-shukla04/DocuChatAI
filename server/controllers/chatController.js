const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { createRetrievalChain } = require('langchain/chains/retrieval');
const { createStuffDocumentsChain } = require('langchain/chains/combine_documents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { PineconeStore } = require('@langchain/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { getPineconeIndex } = require('../services/pineconeService');
const Message = require('../models/Message');
const { appendMessageRecord, getMessageRecords } = require('../utils/inMemoryStore');

const isDbConnected = () => require('mongoose').connection.readyState === 1;

exports.chatWithDocument = async (req, res) => {
  try {
    const { message, docId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-embedding-001',
    });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: getPineconeIndex() });

    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.5-flash',
      maxOutputTokens: 2048,
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a helpful AI assistant. Use the following context from the user's uploaded document to answer their question if it is relevant.
      If the context does not contain the answer, use your general knowledge but clarify the information doesn't come from the document.
      Context: {context}
      Question: {input}
      Answer:`);

    const retriever = vectorStore.asRetriever({ k: 5, filter: docId ? { docId: String(docId) } : undefined });
    const retrievalChain = await createRetrievalChain({
      combineDocsChain: await createStuffDocumentsChain({ llm: model, prompt }),
      retriever,
    });

    const response = await Promise.race([
      retrievalChain.invoke({ input: message }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)),
    ]);

    let finalAnswer = response.answer;
    if (docId && (!response.context || response.context.length === 0)) {
      finalAnswer = "I couldn't find relevant information in the document. Based on general knowledge: " + finalAnswer;
    }

    if (isDbConnected()) {
      await Message.create({ document: docId, role: 'user', content: message });
      await Message.create({ document: docId, role: 'ai', content: finalAnswer });
    } else {
      const ts = new Date().toISOString();
      appendMessageRecord({ document: docId, role: 'user', content: message, createdAt: ts });
      appendMessageRecord({ document: docId, role: 'ai', content: finalAnswer, createdAt: ts });
    }

    res.json({ reply: finalAnswer, context: response.context });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    if (isDbConnected()) {
      return res.json(await Message.find({ document: req.params.docId }).sort({ createdAt: 1 }));
    }
    res.json(getMessageRecords(req.params.docId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

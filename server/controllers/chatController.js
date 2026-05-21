const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { createRetrievalChain } = require('langchain/chains/retrieval');
const { createStuffDocumentsChain } = require('langchain/chains/combine_documents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { PineconeStore } = require('@langchain/pinecone');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const Message = require('../models/Message');

// @desc    Chat with document
// @route   POST /api/chat
// @access  Private
exports.chatWithDocument = async (req, res) => {
  try {
    const { message, docId } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const { getVectorStore } = require('../services/embeddingService');
    const vectorStore = await getVectorStore();

    // Initialize Gemini Chat Model
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.5-flash',
      maxOutputTokens: 2048,
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
      maxRetries: 3
    });

    // Create a prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a helpful AI assistant. Use the following context from the user's uploaded document to answer their question if it is relevant.
      If the context does not contain the answer, you can use your general knowledge to answer the question, but politely clarify that the information doesn't come from the uploaded document.
      
      Context from Document: {context}
      
      User Question: {input}
      
      Answer:
    `);

    // Create chains
    const combineDocsChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    const retriever = vectorStore.asRetriever({
        k: 5, // Get top 5 relevant chunks
        filter: docId ? { docId: String(docId) } : undefined,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });

    // Execute the chain with timeout
    const response = await Promise.race([
      retrievalChain.invoke({ input: message }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000))
    ]);

    let finalAnswer = response.answer;
    
    // Fallback if no context was retrieved but a docId was provided
    if (docId && (!response.context || response.context.length === 0)) {
       console.warn(`No context found for docId: ${docId}`);
       finalAnswer = "I couldn't find relevant information in the uploaded document. However, based on my general knowledge: " + finalAnswer;
    }

    // Save messages to database
    await Message.create({
      document: docId,
      role: 'user',
      content: message
    });

    await Message.create({
      document: docId,
      role: 'ai',
      content: finalAnswer
    });

    res.status(200).json({
      reply: finalAnswer,
      context: response.context,
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat history for a document
// @route   GET /api/chat/:docId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({ document: req.params.docId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

require('dotenv').config();
const mongoose = require('mongoose');
const { processDocument } = require('../rag/pipeline');
const Document = require('../models/Document');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo.");

    const doc = await Document.create({
      filename: "test-pdf-1.pdf",
      originalName: "test-pdf-1.pdf",
      mimeType: "text/plain",
      size: 100
    });

    const fakeBuffer = Buffer.from("Hello world. This is a test document for embedding into pinecone natively without langchain bugs.");

    console.log("Starting processDocument...");
    await processDocument(doc._id, fakeBuffer, "text/plain", "test-pdf-1.pdf");
    console.log("Completed processDocument successfully!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
test();

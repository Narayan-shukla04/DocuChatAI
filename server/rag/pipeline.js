const { parseFile } = require('../parsers');
const Document = require('../models/Document');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { storeVectorsInPinecone } = require('../services/embeddingService');
const { generateImageDescription } = require('../services/visionService');

const processDocument = async (docId, fileBuffer, mimeType, filename) => {
  try {
    let text = '';
    let docType = 'document';

    // Determine if it's an image
    if (mimeType.startsWith('image/')) {
      docType = 'image';
      console.log(`Processing image ${filename} with Gemini Vision...`);
      text = await generateImageDescription(fileBuffer, mimeType);
      
      if (!text) throw new Error('No description generated for image');
      
      // Update document to specify it's an image and store its description
      await Document.findByIdAndUpdate(docId, { 
        textExtracted: true,
        docType: 'image',
        description: text
      });
    } else {
      // It's a text/pdf document
      text = await parseFile(fileBuffer, mimeType);
      if (!text) throw new Error('No text extracted');
      
      await Document.findByIdAndUpdate(docId, { 
        textExtracted: true,
        docType: 'document' 
      });
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const metadata = { 
      docId: String(docId),
      filename: filename || 'unknown',
      docType: docType,
      uploadedBy: 'anonymous',
      timestamp: new Date().toISOString()
    };

    let docs = await splitter.createDocuments([text], [metadata]);
    docs = docs.slice(0, 5); // Limit for testing

    // Use our new central embedding service to upload
    console.log(`Vectorizing ${docs.length} chunks for ${filename}...`);
    await storeVectorsInPinecone(docs);

    await Document.findByIdAndUpdate(docId, { vectorized: true });
    console.log(`Document/Image ${docId} processed and vectorized in Pinecone successfully.`);

  } catch (error) {
    console.error('Error processing file in RAG pipeline:', error);
    await Document.findByIdAndUpdate(docId, { vectorized: false });
  }
};

module.exports = { processDocument };

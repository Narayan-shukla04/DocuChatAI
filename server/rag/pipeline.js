const { parseFile } = require('../parsers');
const Document = require('../models/Document');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { storeVectorsInPinecone } = require('../services/embeddingService');
const { generateImageDescription } = require('../services/visionService');

const processDocument = async (docId, fileBuffer, mimeType, filename) => {
  try {
    const isImage = mimeType.startsWith('image/');
    const text = isImage
      ? await generateImageDescription(fileBuffer, mimeType)
      : await parseFile(fileBuffer, mimeType);

    if (!text) throw new Error(isImage ? 'No description generated for image' : 'No text extracted');

    await Document.findByIdAndUpdate(docId, {
      textExtracted: true,
      docType: isImage ? 'image' : 'document',
      ...(isImage && { description: text }),
    });

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const metadata = { docId: String(docId), filename: filename || 'unknown', docType: isImage ? 'image' : 'document', uploadedBy: 'anonymous', timestamp: new Date().toISOString() };
    const docs = await splitter.createDocuments([text], [metadata]);

    await storeVectorsInPinecone(docs);
    await Document.findByIdAndUpdate(docId, { vectorized: true });
  } catch (error) {
    console.error('RAG pipeline error:', error);
    await Document.findByIdAndUpdate(docId, { vectorized: false });
  }
};

module.exports = { processDocument };

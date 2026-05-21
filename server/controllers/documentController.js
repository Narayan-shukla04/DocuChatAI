const Document = require('../models/Document');
const Message = require('../models/Message');
const { processDocument } = require('../rag/pipeline');
const fs = require('fs');
const path = require('path');

// @desc    Upload and process document
// @route   POST /api/docs/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let previewBase64 = '';
    if (req.file.mimetype.startsWith('image/')) {
      previewBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const doc = await Document.create({
      filename: req.file.originalname, // We no longer save to disk, so originalName acts as filename
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      previewBase64: previewBase64,
    });

    // Trigger LangChain RAG processing synchronously using buffer
    await processDocument(doc._id, req.file.buffer, req.file.mimetype, req.file.originalname);

    res.status(201).json({
      message: 'File uploaded successfully',
      document: doc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user documents
// @route   GET /api/docs
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({}).sort({ createdAt: -1 });
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/docs/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete vectors from Pinecone
    try {
      const { deleteVectorsByDocId } = require('../services/pineconeService');
      await deleteVectorsByDocId(doc._id);
    } catch (pineconeError) {
      console.error('Failed to delete vectors from Pinecone:', pineconeError.message || pineconeError);
    }

    // File is not on disk anymore, so no fs.unlinkSync is needed
    
    // Delete associated chat messages
    await Message.deleteMany({ document: doc._id });

    // Delete document from db
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('Error during document deletion:', error);
    res.status(500).json({ message: error.message });
  }
};


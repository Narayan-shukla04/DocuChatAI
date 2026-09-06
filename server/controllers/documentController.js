const mongoose = require('mongoose');
const Document = require('../models/Document');
const Message = require('../models/Message');
const { processDocument } = require('../rag/pipeline');
const { createDocumentRecord, getDocumentRecords, findDocumentRecord, deleteDocumentRecord } = require('../utils/inMemoryStore');
const { deleteVectorsByDocId } = require('../services/pineconeService');

const isDbConnected = () => mongoose.connection.readyState === 1;

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const previewBase64 = req.file.mimetype.startsWith('image/')
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : '';

    const docData = {
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      previewBase64,
    };

    let doc;
    if (isDbConnected()) {
      doc = await Document.create(docData);
    } else {
      doc = createDocumentRecord(docData);
    }

    await processDocument(doc._id, req.file.buffer, req.file.mimetype, req.file.originalname);

    res.status(201).json({ message: 'File uploaded successfully', document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = isDbConnected()
      ? await Document.find({}).sort({ createdAt: -1 })
      : getDocumentRecords();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    if (isDbConnected()) {
      const doc = await Document.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      try { await deleteVectorsByDocId(doc._id); } catch (e) { console.error('Pinecone delete failed:', e.message); }

      await Message.deleteMany({ document: doc._id });
      await Document.findByIdAndDelete(req.params.id);
    } else {
      if (!findDocumentRecord(req.params.id)) return res.status(404).json({ message: 'Document not found' });
      deleteDocumentRecord(req.params.id);
    }

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

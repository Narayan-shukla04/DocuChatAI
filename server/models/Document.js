const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({

  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  docType: {
    type: String,
    enum: ['document', 'image'],
    default: 'document',
  },
  description: {
    type: String,
    default: '',
  },
  previewBase64: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    required: true,
  },
  textExtracted: {
    type: Boolean,
    default: false,
  },
  vectorized: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Document', documentSchema);

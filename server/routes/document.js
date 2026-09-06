const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);


module.exports = router;

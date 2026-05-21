const express = require('express');
const router = express.Router();
const { chatWithDocument, getChatHistory } = require('../controllers/chatController');

router.post('/', chatWithDocument);
router.get('/:docId', getChatHistory);

module.exports = router;

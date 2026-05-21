const mongoose = require('mongoose');
require('dotenv').config();

async function clearDocs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    await db.collection('documents').deleteMany({});
    console.log('Cleared old documents from database');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clearDocs();

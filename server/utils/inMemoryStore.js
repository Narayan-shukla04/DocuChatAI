const documents = [];
const messages = [];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createDocumentRecord = (data) => {
  const doc = {
    _id: createId(),
    ...data,
    createdAt: new Date().toISOString(),
    textExtracted: false,
    vectorized: false,
  };
  documents.push(doc);
  return doc;
};

const getDocumentRecords = () => [...documents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const findDocumentRecord = (id) => documents.find((doc) => doc._id === id);

const deleteDocumentRecord = (id) => {
  const index = documents.findIndex((doc) => doc._id === id);
  if (index >= 0) {
    documents.splice(index, 1);
    return true;
  }
  return false;
};

const appendMessageRecord = (record) => {
  messages.push(record);
  return record;
};

const getMessageRecords = (docId) => messages.filter((message) => message.document === docId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

module.exports = {
  createDocumentRecord,
  getDocumentRecords,
  findDocumentRecord,
  deleteDocumentRecord,
  appendMessageRecord,
  getMessageRecords,
};

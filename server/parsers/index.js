const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

// Basic parser utility
const parseFile = async (fileBuffer, mimeType) => {
  let text = '';
  
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      text = fileBuffer.toString('utf8');
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      let sheetText = [];
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        sheetText.push(xlsx.utils.sheet_to_csv(sheet));
      });
      text = sheetText.join('\n\n');
    } else {
      console.warn(`Unsupported parsing for mimeType: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error parsing file:', error);
  }
  
  return text;
};

module.exports = { parseFile };

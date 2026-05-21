const parsers = require('./parsers');
const path = require('path');

async function testParse() {
  const filePath = path.join(__dirname, 'uploads', 'file-1778587207645-542602620.pdf');
  try {
    const text = await parsers.parseFile(filePath, 'application/pdf');
    console.log('Extracted text preview:', text.substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}

testParse();

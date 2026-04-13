const fs = require('fs');
const path = require('path');

/**
 * Load resume file from data/raw/resume.pdf
 * Returns a Buffer of the PDF file.
 */
const loadResumeBuffer = () => {
  const filePath = path.resolve(__dirname, '../../data/raw/resume.pdf');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Resume PDF not found at path: ${filePath}`);
  }

  return fs.readFileSync(filePath);
};

module.exports = {
  loadResumeBuffer
};

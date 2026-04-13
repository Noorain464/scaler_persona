const { loadResumeBuffer } = require('../src/services/resume/resumeLoader');
const { extractAndCleanResume, parseStructuredResume } = require('../src/services/resume/resumeParser');
// const { chunkLogicalSections } = require('../src/services/rag/chunker'); // No longer purely chunks, we want structured JSON
const fs = require('fs');
const path = require('path');

const run = async () => {
  console.log('[Script] Running isolate resume ingestion...');
  try {
    const buffer = loadResumeBuffer();
    const cleanText = await extractAndCleanResume(buffer);
    
    // Parse to structured json
    const structuredJSON = parseStructuredResume(cleanText);
    
    const outputPath = path.resolve(__dirname, '../src/data/processed/structured_resume.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(structuredJSON, null, 2)
    );
    console.log('[Script] Resume structured and saved successfully to ' + outputPath);
  } catch (error) {
    console.error('[Script] Resume ingestion failed:', error.message);
  }
};

run();

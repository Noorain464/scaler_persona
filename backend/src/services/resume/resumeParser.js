const pdfParse = require('pdf-parse');

/**
 * Extract resume text from PDF buffer and clean up formatting
 * 
 * @param {Buffer} pdfBuffer 
 * @returns {string} Cleaned resume text string
 */
const extractAndCleanResume = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    let text = data.text;

    // Clean weird PDF formatting
    text = text.replace(/-\n/g, '');            // Remove hyphenated broken lines
    text = text.replace(/\n{2,}/g, '\n\n');     // Collapse excessive newlines safely
    text = text.replace(/[ \t]{2,}/g, ' ');     // Collapse repeated spaces/tabs
    text = text.trim();

    return text;
  } catch (error) {
    console.error(`[Resume Parser] Failed to parse PDF content`, error);
    throw error;
  }
};

/**
 * Parses cleaned resume text into a structured JSON format
 */
const parseStructuredResume = (cleanText) => {
  const structured = {
    education: "",
    experience: "",
    skills: "",
    projects: "",
    other: ""
  };

  const sections = cleanText.split(/(?:\n|^)(?=Education|Experience|Projects|Skills|Summary|Work History|Certifications)/i);
  
  for (let part of sections) {
    const match = part.match(/^(Education|Experience|Projects|Skills|Summary|Work History|Certifications)/i);
    if (match) {
      const secName = match[1].toLowerCase();
      let targetSection = 'other';
      if (secName === 'work history' || secName === 'experience') targetSection = 'experience';
      else if (secName === 'education') targetSection = 'education';
      else if (secName === 'skills') targetSection = 'skills';
      else if (secName === 'projects') targetSection = 'projects';

      const content = part.substring(match[0].length).trim();
      structured[targetSection] = (structured[targetSection] + '\n\n' + content).trim();
    } else {
      structured.other = (structured.other + '\n\n' + part).trim();
    }
  }

  // Remove empty keys to match exact requested format
  const result = {
    education: structured.education,
    experience: structured.experience,
    skills: structured.skills,
    projects: structured.projects
  };

  return result;
};

module.exports = {
  extractAndCleanResume,
  parseStructuredResume
};

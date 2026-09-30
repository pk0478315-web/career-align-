const fs = require('fs');
const pdfParse = require('pdf-parse');
const aiService = require('./aiService');

class ResumeService {
  async parsePdf(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (err) {
      throw new Error('Failed to parse PDF resume: ' + err.message);
    }
  }

  async extractResumeInfo(resumeText) {
    const prompt = `You are an expert Resume Parser.
Given the following raw text from a PDF resume, extract the structured information.
DO NOT invent information. If a field is missing, leave it empty.

Resume Text:
${resumeText.substring(0, 8000)}

Return strictly valid JSON matching this schema:
{
  "education": [
    { "institution": "...", "degree": "...", "year": "..." }
  ],
  "skills": ["...", "..."],
  "experience": [
    { "company": "...", "role": "...", "duration": "...", "description": "..." }
  ],
  "projects": [
    { "name": "...", "description": "..." }
  ],
  "certifications": ["...", "..."],
  "achievements": ["...", "..."]
}
`;

    let parsed = null;
    try {
      const response = await aiService.callGemini(prompt);
      if (response) {
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Resume Extraction Parse Error:', e);
    }

    if (!parsed) {
      throw new Error('Failed to extract resume data via AI.');
    }

    return parsed;
  }

  async alignResumeWithOpportunity(parsedResume, opportunity) {
    const prompt = `You are a strict Career Align AI.
Compare the applicant's Parsed Resume with the Opportunity Description.
DO NOT invent skills or experience the applicant does not have.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

OPPORTUNITY:
Title: ${opportunity.title}
Organization: ${opportunity.organization}
Requirements: ${opportunity.requirements?.join('; ')}
Description: ${opportunity.description?.substring(0, 1000)}

Return strictly valid JSON matching this schema:
{
  "matchingSkills": ["..."],
  "missingSkills": ["..."],
  "relevantExperience": ["..."],
  "missingExperience": ["..."],
  "relevantProjects": ["..."],
  "improvementSuggestions": ["...", "..."],
  "relevantKeywords": ["...", "..."]
}
`;

    let parsed = null;
    try {
      const response = await aiService.callGemini(prompt);
      if (response) {
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Resume Alignment Parse Error:', e);
    }

    if (!parsed) {
      throw new Error('Failed to generate resume alignment via AI.');
    }

    return parsed;
  }

  async improveResume(parsedResume, opportunity) {
    const prompt = `You are an expert Resume Writer AI.
Improve the wording of the provided Resume to better fit the Opportunity.
CRITICAL RULES:
1. DO NOT invent experience, qualifications, projects, achievements, or employment history.
2. Only improve the phrasing, highlight relevant keywords naturally, and fix grammar.

RESUME:
${JSON.stringify(parsedResume, null, 2)}

OPPORTUNITY:
Title: ${opportunity.title}
Requirements: ${opportunity.requirements?.join('; ')}

Return strictly valid JSON matching the same schema as the original resume, but with improved descriptions and roles:
{
  "education": [
    { "institution": "...", "degree": "...", "year": "..." }
  ],
  "skills": ["...", "..."],
  "experience": [
    { "company": "...", "role": "...", "duration": "...", "description": "Improved description here..." }
  ],
  "projects": [
    { "name": "...", "description": "Improved description here..." }
  ],
  "certifications": ["...", "..."],
  "achievements": ["...", "..."]
}
`;

    let parsed = null;
    try {
      const response = await aiService.callGemini(prompt);
      if (response) {
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Resume Improvement Parse Error:', e);
    }

    if (!parsed) {
      throw new Error('Failed to improve resume via AI.');
    }

    return parsed;
  }
}

module.exports = new ResumeService();

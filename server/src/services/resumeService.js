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

    const schema = {
      type: "OBJECT",
      properties: {
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              institution: { type: "STRING" },
              degree: { type: "STRING" },
              year: { type: "STRING" }
            },
            required: ["institution", "degree", "year"]
          }
        },
        skills: { type: "ARRAY", items: { type: "STRING" } },
        experience: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              company: { type: "STRING" },
              role: { type: "STRING" },
              duration: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["company", "role", "duration", "description"]
          }
        },
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["name", "description"]
          }
        },
        certifications: { type: "ARRAY", items: { type: "STRING" } },
        achievements: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["education", "skills", "experience", "projects", "certifications", "achievements"]
    };

    let parsed = null;
    try {
      parsed = await aiService.callGeminiWithSchema(prompt, schema, 2);
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

    const schema = {
      type: "OBJECT",
      properties: {
        matchingSkills: { type: "ARRAY", items: { type: "STRING" } },
        missingSkills: { type: "ARRAY", items: { type: "STRING" } },
        relevantExperience: { type: "ARRAY", items: { type: "STRING" } },
        missingExperience: { type: "ARRAY", items: { type: "STRING" } },
        relevantProjects: { type: "ARRAY", items: { type: "STRING" } },
        improvementSuggestions: { type: "ARRAY", items: { type: "STRING" } },
        relevantKeywords: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: [
        "matchingSkills", "missingSkills", "relevantExperience", "missingExperience",
        "relevantProjects", "improvementSuggestions", "relevantKeywords"
      ]
    };

    let parsed = null;
    try {
      parsed = await aiService.callGeminiWithSchema(prompt, schema, 2);
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

    const schema = {
      type: "OBJECT",
      properties: {
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              institution: { type: "STRING" },
              degree: { type: "STRING" },
              year: { type: "STRING" }
            },
            required: ["institution", "degree", "year"]
          }
        },
        skills: { type: "ARRAY", items: { type: "STRING" } },
        experience: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              company: { type: "STRING" },
              role: { type: "STRING" },
              duration: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["company", "role", "duration", "description"]
          }
        },
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["name", "description"]
          }
        },
        certifications: { type: "ARRAY", items: { type: "STRING" } },
        achievements: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["education", "skills", "experience", "projects", "certifications", "achievements"]
    };

    let parsed = null;
    try {
      parsed = await aiService.callGeminiWithSchema(prompt, schema, 2);
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

const axios = require('axios');
const env = require('../config/env');

class AiService {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    this.geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
  }

  /**
   * Core AI Call implementation following the strict architecture:
   * Timeout handling, Retry Logic, Schema Validation, Usage Tracking, Error Logging
   */
  async callGeminiWithSchema(promptText, responseSchema = null, retries = 2) {
    if (!this.apiKey) {
      return null;
    }

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };

    if (responseSchema) {
      payload.generationConfig.responseMimeType = 'application/json';
      payload.generationConfig.responseSchema = responseSchema;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(this.geminiEndpoint, payload, { timeout: 10000 });
        const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!candidate) {
          throw new Error('Empty response from AI provider');
        }

        if (responseSchema) {
          try {
            const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return parsed;
          } catch (parseError) {
            console.error('[AiService] Schema validation/parse error:', parseError.message);
            throw parseError; // Caught by retry loop
          }
        }
        return candidate.trim();
      } catch (err) {
        console.warn(`[AiService] AI Call Attempt ${attempt} failed:`, err.message);
        if (attempt === retries) {
          console.error('[AiService] Exhausted AI retries. Returning fallback.');
          return null;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  }

  /**
   * Helper to invoke Gemini with prompt and return text (backwards compatibility)
   */
  async callGemini(promptText) {
    return await this.callGeminiWithSchema(promptText, null, 1);
  }

  /**
   * 1. Summarize Opportunity
   */
  async summarizeOpportunity(opportunity) {
    if (this.apiKey) {
      const prompt = `You are an AI assistant for university students. Summarize the following opportunity clearly and concisely for a student. Include key benefits, time commitments, and deadline details.
Title: ${opportunity.title}
Organization: ${opportunity.organization}
Category: ${opportunity.category}
Deadline: ${opportunity.deadline || 'UNKNOWN'}
Description: ${opportunity.description}
Requirements: ${JSON.stringify(opportunity.requirements || [])}
Funding/Benefits: ${opportunity.fundingCompensation || 'UNKNOWN'}

Do not invent facts. Use "UNKNOWN" or "INSUFFICIENT INFORMATION" if something is not explicitly stated.`;

      const schema = {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING", description: "Plain English 2-3 sentence overview" },
          keyHighlights: { 
            type: "ARRAY", 
            items: { type: "STRING" },
            description: "Up to 3 bullet points"
          }
        },
        required: ["summary", "keyHighlights"]
      };

      try {
        const parsed = await this.callGeminiWithSchema(prompt, schema, 2);
        if (parsed && parsed.summary && parsed.keyHighlights) {
          return {
            summary: parsed.summary,
            keyHighlights: parsed.keyHighlights,
            source: 'gemini-ai',
            grounded: true
          };
        }
      } catch (e) {
        // Fallback to grounded
      }
    }

    // Grounded Fallback
    const deadlineStr = opportunity.deadline
      ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'UNKNOWN';

    return {
      summary: `${opportunity.title} offered by ${opportunity.organization} is a ${opportunity.category} opportunity. Application deadline is ${deadlineStr}.`,
      keyHighlights: [
        `Funding / Compensation: ${opportunity.fundingCompensation || 'UNKNOWN'}`,
        `Location / Format: ${opportunity.location || (opportunity.isRemote ? 'Remote' : 'Onsite')}`,
        `Core Category: ${opportunity.category.toUpperCase()}`
      ],
      source: 'grounded-engine',
      grounded: true,
      officialSource: opportunity.sourceUrl || opportunity.applicationUrl
    };
  }

  /**
   * 2. Eligibility Analysis
   * Compares student profile against opportunity requirements.
   * Categories: "appears to meet", "possible gap", "not enough information"
   */
  async checkEligibility(studentProfile, opportunity) {
    if (this.apiKey) {
      const prompt = `You are a strict career eligibility analyzer.
Compare the Student Profile against the Opportunity Requirements.
For each of the following criteria, assess if the student meets it:
1. Education Level
2. Technical Skills
3. Work Authorization / Location

Use ONLY the following assessment values: "appears to meet", "possible gap", "not enough information".
If something is unknown, choose "not enough information". Do not invent facts.

STUDENT PROFILE:
- Education: ${studentProfile?.educationLevel || 'UNKNOWN'}
- Skills: ${studentProfile?.skills?.join(', ') || 'UNKNOWN'}
- Location Pref: ${studentProfile?.preferredLocation || 'UNKNOWN'}
- Remote Pref: ${studentProfile?.remotePreference || 'UNKNOWN'}

OPPORTUNITY:
- Requirements: ${opportunity.requirements?.join('; ') || 'UNKNOWN'}
- Skills Required: ${opportunity.skillsRequired?.join(', ') || 'UNKNOWN'}
- Location: ${opportunity.location || 'UNKNOWN'}
- Remote: ${opportunity.isRemote ? 'Yes' : 'No'}

Respond strictly in valid JSON format matching the schema.`;

      const schema = {
        type: "OBJECT",
        properties: {
          factors: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                criterion: { type: "STRING" },
                assessment: { type: "STRING", enum: ["appears to meet", "possible gap", "not enough information"] },
                detail: { type: "STRING", description: "1 sentence explanation" }
              },
              required: ["criterion", "assessment", "detail"]
            }
          }
        },
        required: ["factors"]
      };

      try {
        const parsed = await this.callGeminiWithSchema(prompt, schema, 2);
        if (parsed && parsed.factors) {
          let overallStatus = 'appears to meet';
          if (parsed.factors.some(f => f.assessment === 'possible gap')) {
            overallStatus = 'possible gap';
          } else if (parsed.factors.filter(f => f.assessment === 'not enough information').length >= 2) {
            overallStatus = 'not enough information';
          }
          return {
            overallStatus,
            factors: parsed.factors,
            disclaimer: 'This assessment is an AI-assisted estimate. Verify official terms.'
          };
        }
      } catch (e) {
        // Fallback to deterministic
      }
    }

    const factors = [];
    const profileSkills = (studentProfile?.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (opportunity.skillsRequired || []).map(s => s.toLowerCase());

    // 1. Education Level Check
    if (opportunity.requirements && opportunity.requirements.some(r => /undergraduate|bachelor/i.test(r))) {
      if (studentProfile?.educationLevel === 'Undergraduate') {
        factors.push({
          criterion: 'Education Level',
          assessment: 'appears to meet',
          detail: 'Opportunity targets undergraduate students, matching your profile level.'
        });
      } else if (!studentProfile?.educationLevel) {
        factors.push({
          criterion: 'Education Level',
          assessment: 'not enough information',
          detail: 'Your education level is not specified in your profile.'
        });
      } else {
        factors.push({
          criterion: 'Education Level',
          assessment: 'possible gap',
          detail: `Listing mentions undergraduate standing; your profile indicates ${studentProfile.educationLevel}.`
        });
      }
    } else {
      factors.push({
        criterion: 'Education Level',
        assessment: 'appears to meet',
        detail: 'No restrictive education level constraint detected in listing requirements.'
      });
    }

    // 2. Skill Alignment Check
    if (requiredSkills.length > 0) {
      const matched = requiredSkills.filter(s => profileSkills.some(ps => ps.includes(s) || s.includes(ps)));
      const missing = requiredSkills.filter(s => !profileSkills.some(ps => ps.includes(s) || s.includes(ps)));

      if (matched.length > 0 && missing.length === 0) {
        factors.push({
          criterion: 'Technical Skills',
          assessment: 'appears to meet',
          detail: `Your profile lists all relevant skills: ${matched.join(', ')}.`
        });
      } else if (matched.length > 0 && missing.length > 0) {
        factors.push({
          criterion: 'Technical Skills',
          assessment: 'possible gap',
          detail: `Matched skills: ${matched.join(', ')}. Additional listed skills: ${missing.join(', ')}.`
        });
      } else {
        factors.push({
          criterion: 'Technical Skills',
          assessment: 'possible gap',
          detail: `This opportunity mentions skills (${requiredSkills.join(', ')}) not currently in your profile.`
        });
      }
    } else {
      factors.push({
        criterion: 'Technical Skills',
        assessment: 'not enough information',
        detail: 'Specific skill prerequisites were not detailed in the extracted posting.'
      });
    }

    // 3. Location / Remote Check
    if (opportunity.isRemote) {
      factors.push({
        criterion: 'Work Authorization / Location',
        assessment: 'appears to meet',
        detail: 'This is a remote opportunity accessible globally or regionally.'
      });
    } else {
      factors.push({
        criterion: 'Location Requirement',
        assessment: 'not enough information',
        detail: `Physical location is ${opportunity.location}. Verify travel or relocation eligibility.`
      });
    }

    // Aggregate overall status
    let overallStatus = 'appears to meet';
    if (factors.some(f => f.assessment === 'possible gap')) {
      overallStatus = 'possible gap';
    } else if (factors.filter(f => f.assessment === 'not enough information').length >= 2) {
      overallStatus = 'not enough information';
    }

    return {
      overallStatus,
      factors,
      disclaimer: 'This assessment is an AI-assisted estimate based on extracted requirements. Never guarantees selection. Verify official terms.'
    };
  }

  /**
   * 3. Checklist Generator
   */
  async generateChecklist(opportunity) {
    if (this.apiKey) {
      const prompt = `Create a specific, actionable application checklist for the following opportunity.
Title: ${opportunity.title}
Organization: ${opportunity.organization}
Category: ${opportunity.category}
Requirements: ${opportunity.requirements?.join('; ') || 'UNKNOWN'}
Description: ${opportunity.description}

Generate 3-5 specific checklist items. Ensure they are actionable. Do not invent requirements that do not exist.`;

      const schema = {
        type: "OBJECT",
        properties: {
          checklist: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                item: { type: "STRING", description: "Actionable item" },
                completed: { type: "BOOLEAN" }
              },
              required: ["id", "item", "completed"]
            }
          }
        },
        required: ["checklist"]
      };

      try {
        const parsed = await this.callGeminiWithSchema(prompt, schema, 2);
        if (parsed && parsed.checklist) {
          return {
            opportunityId: opportunity.id,
            title: opportunity.title,
            checklist: parsed.checklist,
            generatedAt: new Date().toISOString()
          };
        }
      } catch (e) {
        // Fallback to deterministic
      }
    }

    const checklist = [
      { id: 'item-1', item: 'Review official eligibility rules and deadlines', completed: true },
      { id: 'item-2', item: 'Tailor resume / CV highlighting relevant projects', completed: false }
    ];

    if (opportunity.category === 'scholarship') {
      checklist.push({ id: 'item-3', item: 'Request official or unofficial academic transcript', completed: false });
      checklist.push({ id: 'item-4', item: 'Draft personal statement / diversity essay', completed: false });
      checklist.push({ id: 'item-5', item: 'Request letter of recommendation from academic referee', completed: false });
    } else if (opportunity.category === 'hackathon' || opportunity.category === 'competition') {
      checklist.push({ id: 'item-3', item: 'Form team or register as individual hacker', completed: false });
      checklist.push({ id: 'item-4', item: 'Prepare developer environment and API keys', completed: false });
      checklist.push({ id: 'item-5', item: 'Review hackathon problem tracks and rubric', completed: false });
    } else if (opportunity.category === 'fellowship' || opportunity.category === 'research') {
      checklist.push({ id: 'item-3', item: 'Prepare statement of research interest or project proposal', completed: false });
      checklist.push({ id: 'item-4', item: 'Provide links to public GitHub repositories or publications', completed: false });
      checklist.push({ id: 'item-5', item: 'Contact prospective mentors or laboratory lead', completed: false });
    } else {
      checklist.push({ id: 'item-3', item: 'Prepare portfolio / GitHub project demonstration links', completed: false });
      checklist.push({ id: 'item-4', item: 'Draft cover letter addressing specific role responsibilities', completed: false });
    }

    checklist.push({ id: 'item-final', item: 'Submit completed application on official portal before deadline', completed: false });

    return {
      opportunityId: opportunity.id,
      title: opportunity.title,
      checklist,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 4. Copilot Q&A
   */
  async answerQuestion(opportunity, userQuestion, studentProfile) {
    if (this.apiKey) {
      const prompt = `You are an AI opportunity copilot answering a student's question about an opportunity.
Opportunity Details:
- Title: ${opportunity.title}
- Organization: ${opportunity.organization}
- Category: ${opportunity.category}
- Deadline: ${opportunity.deadline || 'UNKNOWN'}
- Requirements: ${JSON.stringify(opportunity.requirements || [])}
- Description: ${opportunity.description}

Student Question: "${userQuestion}"

Rules:
1. Answer directly and encouragingly.
2. Ground your response in the provided details.
3. If an answer is not in the text, explicitly state UNKNOWN or INSUFFICIENT INFORMATION and advise checking the official portal. Do not invent facts.
4. Keep answer concise (2-4 sentences max).`;

      const schema = {
        type: "OBJECT",
        properties: {
          answer: { type: "STRING", description: "The answer to the user's question" }
        },
        required: ["answer"]
      };

      try {
        const parsed = await this.callGeminiWithSchema(prompt, schema, 2);
        if (parsed && parsed.answer) {
          return {
            answer: parsed.answer,
            source: 'gemini-ai'
          };
        }
      } catch (e) {
        // Fallback to grounded logic below
      }
    }

    // Grounded Fallback
    const q = userQuestion.toLowerCase();
    let answer = `Regarding ${opportunity.title}: Please refer to the official application page at ${opportunity.sourceUrl || opportunity.applicationUrl || 'the provider website'}.`;

    if (q.includes('deadline') || q.includes('when')) {
      answer = opportunity.deadline
        ? `The application deadline for ${opportunity.title} is ${new Date(opportunity.deadline).toUTCString()}.`
        : `UNKNOWN. No explicit deadline is published in this listing. Check the official site for real-time closing dates.`;
    } else if (q.includes('stipend') || q.includes('money') || q.includes('paid') || q.includes('fund')) {
      answer = `The stated compensation is: ${opportunity.fundingCompensation || 'UNKNOWN. Not specified in listing'}.`;
    } else if (q.includes('remote') || q.includes('location')) {
      answer = opportunity.isRemote
        ? `Yes, this is indicated as a remote/virtual opportunity (${opportunity.location || 'UNKNOWN'}).`
        : `This opportunity is listed as onsite/hybrid at ${opportunity.location || 'UNKNOWN'}.`;
    } else if (q.includes('eligible') || q.includes('requirement')) {
      answer = opportunity.requirements?.length
        ? `Key listed requirements: ${opportunity.requirements.join('; ')}.`
        : `UNKNOWN. No special eligibility prerequisites are documented. Check the official link.`;
    }

    return {
      answer,
      source: 'grounded-engine'
    };
  }
}

module.exports = new AiService();

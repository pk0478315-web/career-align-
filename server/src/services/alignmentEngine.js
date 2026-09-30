const aiService = require('./aiService');

class AlignmentEngine {
  /**
   * Deterministically calculate some sub-scores
   */
  calculateDeterministicScores(student, opportunity) {
    // 1. Skill Alignment (0-100)
    let skillScore = 0;
    const studentSkills = (student.skills || []).map(s => s.toLowerCase());
    const reqSkills = (opportunity.skillsRequired || []).map(s => s.toLowerCase());
    
    if (reqSkills.length === 0) {
      skillScore = 100; // No specific skills required, assume match or NA
    } else {
      const matched = reqSkills.filter(req => studentSkills.some(ss => ss.includes(req) || req.includes(ss)));
      skillScore = Math.round((matched.length / reqSkills.length) * 100);
    }

    // 2. Location Alignment (0-100)
    let locScore = 50;
    if (opportunity.isRemote && student.remotePreference === 'remote') {
      locScore = 100;
    } else if (opportunity.isRemote && student.remotePreference === 'flexible') {
      locScore = 90;
    } else if (!opportunity.isRemote && opportunity.location) {
      if (student.preferredLocation && opportunity.location.toLowerCase().includes(student.preferredLocation.toLowerCase())) {
        locScore = 100;
      } else if (student.remotePreference === 'remote') {
        locScore = 20; // Wants remote but is onsite elsewhere
      } else {
        locScore = 50; // Onsite but location doesn't match perfectly
      }
    } else {
      locScore = 80;
    }

    // 3. Education Alignment (0-100)
    let eduScore = 100;
    const eduReq = (opportunity.requirements || []).join(' ').toLowerCase() + ' ' + (opportunity.educationRequirements || []).join(' ').toLowerCase();
    const studentEdu = (student.educationLevel || '').toLowerCase();
    
    if (eduReq.includes('master') || eduReq.includes('phd')) {
      if (studentEdu.includes('undergrad') || studentEdu.includes('high school')) {
        eduScore = 20;
      } else if (studentEdu.includes('master') || studentEdu.includes('phd')) {
        eduScore = 100;
      }
    } else if (eduReq.includes('undergrad') || eduReq.includes('bachelor')) {
      if (studentEdu.includes('undergrad') || studentEdu.includes('bachelor')) {
        eduScore = 100;
      }
    }

    return { skillScore, locScore, eduScore };
  }

  /**
   * Generates a full alignment report using deterministic scoring + LLM semantic analysis
   */
  async generateAlignment(student, opportunity) {
    // Basic validation
    if (!student || !opportunity) {
      throw new Error("Missing student or opportunity data");
    }

    // Deterministic base scores
    const { skillScore, locScore, eduScore } = this.calculateDeterministicScores(student, opportunity);

    // Call LLM for semantic alignment (career goals, experience, interests, texts)
    const prompt = `You are a Career Alignment Engine.
Compare the Student Profile with the Opportunity and output a structured JSON analysis.

STUDENT:
- Education: ${student.educationLevel}, ${student.major}, Graduating ${student.graduationYear}
- Skills: ${student.skills?.join(', ') || 'None listed'}
- Interests: ${student.interests?.join(', ') || 'None listed'}
- Career Goals: ${student.careerGoals || 'None listed'}

OPPORTUNITY:
- Title: ${opportunity.title}
- Organization: ${opportunity.organization}
- Category: ${opportunity.category}
- Required Skills: ${opportunity.skillsRequired?.join(', ') || 'None listed'}
- Requirements: ${opportunity.requirements?.join('; ') || 'None listed'}
- Description: ${opportunity.description?.substring(0, 500)}...

We have deterministically calculated the following scores (0-100):
- Skill Alignment: ${skillScore}
- Location Alignment: ${locScore}
- Education Alignment: ${eduScore}

Task:
Perform semantic matching to evaluate Experience, Career Goal, and Interest alignment (0-100).
Then provide explanations for all 6 categories, lists of strengths/gaps, and summary texts.
Do not invent evidence. Do not claim that high scores guarantee selection.

Respond strictly in valid JSON format:
{
  "skillAlignment": { "score": ${skillScore}, "explanation": "..." },
  "educationAlignment": { "score": ${eduScore}, "explanation": "..." },
  "locationAlignment": { "score": ${locScore}, "explanation": "..." },
  "experienceAlignment": { "score": <0-100>, "explanation": "..." },
  "careerGoalAlignment": { "score": <0-100>, "explanation": "..." },
  "interestAlignment": { "score": <0-100>, "explanation": "..." },
  "matchingStrengths": ["...", "..."],
  "missingRequirements": ["...", "..."],
  "potentialGaps": ["...", "..."],
  "whyItMatches": "Short paragraph explaining why this fits the student.",
  "whatYouHave": "Short paragraph summarizing what the student brings.",
  "whatIsMissing": "Short paragraph summarizing the gaps.",
  "recommendedNextAction": "Actionable next step for the student."
}`;

    const schema = {
      type: "OBJECT",
      properties: {
        skillAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        educationAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        locationAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        experienceAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        careerGoalAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        interestAlignment: {
          type: "OBJECT",
          properties: { score: { type: "NUMBER" }, explanation: { type: "STRING" } },
          required: ["score", "explanation"]
        },
        matchingStrengths: { type: "ARRAY", items: { type: "STRING" } },
        missingRequirements: { type: "ARRAY", items: { type: "STRING" } },
        potentialGaps: { type: "ARRAY", items: { type: "STRING" } },
        whyItMatches: { type: "STRING" },
        whatYouHave: { type: "STRING" },
        whatIsMissing: { type: "STRING" },
        recommendedNextAction: { type: "STRING" }
      },
      required: [
        "skillAlignment", "educationAlignment", "locationAlignment", 
        "experienceAlignment", "careerGoalAlignment", "interestAlignment",
        "matchingStrengths", "missingRequirements", "potentialGaps",
        "whyItMatches", "whatYouHave", "whatIsMissing", "recommendedNextAction"
      ]
    };

    let aiData = null;
    try {
      aiData = await aiService.callGeminiWithSchema(prompt, schema, 2);
    } catch (e) {
      console.warn('Alignment Engine LLM Parse Error:', e);
    }

    // Fallback if LLM fails or is unavailable
    if (!aiData) {
      aiData = {
        skillAlignment: { score: skillScore, explanation: "Based on keyword matching of your skills." },
        educationAlignment: { score: eduScore, explanation: "Based on your education level." },
        locationAlignment: { score: locScore, explanation: "Based on location preferences." },
        experienceAlignment: { score: 50, explanation: "Experience alignment could not be semantically evaluated." },
        careerGoalAlignment: { score: 50, explanation: "Career goal alignment could not be semantically evaluated." },
        interestAlignment: { score: 50, explanation: "Interest alignment could not be semantically evaluated." },
        matchingStrengths: ["Core skills match"],
        missingRequirements: [],
        potentialGaps: ["Could not fully evaluate semantics"],
        whyItMatches: "This opportunity shares some keywords with your profile.",
        whatYouHave: "Basic eligibility.",
        whatIsMissing: "AI analysis unavailable.",
        recommendedNextAction: "Review manually."
      };
    }

    // Enforce Deterministic Overall Score
    // Weighting: Skills 30%, Education 20%, Career Goals 20%, Experience 10%, Interests 10%, Location 10%
    const overallScore = Math.round(
      (aiData.skillAlignment.score * 0.30) +
      (aiData.educationAlignment.score * 0.20) +
      (aiData.careerGoalAlignment.score * 0.20) +
      (aiData.experienceAlignment.score * 0.10) +
      (aiData.interestAlignment.score * 0.10) +
      (aiData.locationAlignment.score * 0.10)
    );

    return {
      ...aiData,
      overallScore,
      disclaimer: "Scores are deterministically weighted estimates based on profile data and semantic analysis. They do not guarantee selection."
    };
  }
}

module.exports = new AlignmentEngine();

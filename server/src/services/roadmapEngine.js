const aiService = require('./aiService');

class RoadmapEngine {
  /**
   * Generates a career roadmap based on student profile.
   * @param {Object} profile Student profile from dbStore
   */
  async generateRoadmap(profile) {
    if (!profile) {
      throw new Error("Profile is required to generate roadmap");
    }

    const targetCareer = profile.careerGoals || 'Professional in chosen field';
    
    const prompt = `You are an expert Career Advisor AI.
Create a personalized career roadmap for the student to achieve their target career.

STUDENT PROFILE:
- Target Career: ${targetCareer}
- Education: ${profile.educationLevel}, ${profile.major}, Graduating ${profile.graduationYear}
- Current Skills: ${profile.skills?.join(', ') || 'None listed'}
- Interests: ${profile.interests?.join(', ') || 'None listed'}

Do not fabricate any existing experience, certifications, or courses. Only use the provided profile data.

Generate a structured JSON roadmap matching this exact format:
{
  "targetCareer": "${targetCareer}",
  "currentState": "A short summary of their current position based strictly on their profile.",
  "currentSkills": ["...", "..."],
  "missingSkills": ["...", "..."],
  "learningPriorities": [
    { "topic": "...", "reason": "...", "resources": "..." }
  ],
  "suggestedProjects": [
    { "title": "...", "description": "...", "skills_used": ["..."] }
  ],
  "milestones": [
    { "id": "m1", "title": "...", "description": "...", "status": "pending" },
    { "id": "m2", "title": "...", "description": "...", "status": "pending" },
    { "id": "m3", "title": "...", "description": "...", "status": "pending" }
  ],
  "progress": 0
}

Ensure "status" in milestones is exactly "pending".
`;

    let aiData = null;
    try {
      const aiResponse = await aiService.callGemini(prompt);
      if (aiResponse) {
        const cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        aiData = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Roadmap Engine LLM Parse Error:', e);
      throw new Error('Failed to generate career roadmap from AI.');
    }

    if (!aiData || !aiData.milestones) {
      console.warn('AI returned malformed data. Using safe fallback.');
      aiData = {
        targetCareer: targetCareer,
        currentState: 'Basic profile created.',
        currentSkills: profile.skills || [],
        missingSkills: ['Advanced Frameworks', 'System Design'],
        learningPriorities: [
          { topic: 'Foundational Knowledge', reason: 'Needed for technical interviews', resources: 'Online documentation' }
        ],
        suggestedProjects: [
          { title: 'Portfolio Project', description: 'Showcase your skills', skills_used: ['React', 'Node.js'] }
        ],
        milestones: [
          { id: 'm1', title: 'Complete missing skills', description: 'Self-study', status: 'pending' },
          { id: 'm2', title: 'Build a project', description: 'Apply skills', status: 'pending' },
          { id: 'm3', title: 'Apply to roles', description: 'Send out applications', status: 'pending' }
        ],
        progress: 0
      };
    }

    // Ensure proper schema formats
    return {
      targetCareer: aiData.targetCareer || targetCareer,
      currentState: aiData.currentState || 'Profile reviewed.',
      currentSkills: Array.isArray(aiData.currentSkills) ? aiData.currentSkills : profile.skills,
      missingSkills: Array.isArray(aiData.missingSkills) ? aiData.missingSkills : [],
      learningPriorities: Array.isArray(aiData.learningPriorities) ? aiData.learningPriorities : [],
      suggestedProjects: Array.isArray(aiData.suggestedProjects) ? aiData.suggestedProjects : [],
      milestones: Array.isArray(aiData.milestones) ? aiData.milestones.map((m, idx) => ({
        id: m.id || `m${idx+1}`,
        title: m.title || `Milestone ${idx+1}`,
        description: m.description || '',
        status: 'pending'
      })) : [],
      progress: 0
    };
  }
}

module.exports = new RoadmapEngine();

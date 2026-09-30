const dbStore = require('../data/dbStore');
const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');

const summarizeOpportunity = async (req, res, next) => {
  try {
    const { opportunityId, text } = req.body;

    let targetOpp = null;
    if (opportunityId) {
      targetOpp = await dbStore.getOpportunityById(opportunityId);
    }

    if (!targetOpp && !text) {
      return sendError(res, 'Either opportunityId or text content is required for summarization', 400, 'VALIDATION_ERROR');
    }

    const payload = targetOpp || {
      id: 'custom-text',
      title: 'Provided Text',
      organization: 'External Source',
      category: 'other',
      description: text,
      requirements: [],
      fundingCompensation: 'Unknown'
    };

    const result = await aiService.summarizeOpportunity(payload);

    // Audit log
    await dbStore.logAiInteraction(
      req.user?.id || null,
      targetOpp?.id || null,
      'summarize',
      { opportunityId, textSnippet: text?.substring(0, 100) },
      result
    );

    if (req.user) await dbStore.incrementAiUsage(req.user.id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const checkEligibility = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400, 'VALIDATION_ERROR');
    }

    const opportunity = await dbStore.getOpportunityById(opportunityId);
    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    // Get student profile if authenticated, otherwise use generic profile
    let profile = null;
    if (req.user) {
      profile = await dbStore.getProfile(req.user.id);
    } else {
      profile = {
        educationLevel: 'Undergraduate',
        skills: ['Python', 'JavaScript'],
        interests: ['Web Development', 'AI Research']
      };
    }

    const analysis = await aiService.checkEligibility(profile, opportunity);

    await dbStore.logAiInteraction(
      req.user?.id || null,
      opportunityId,
      'eligibility',
      { opportunityId },
      analysis
    );

    if (req.user) await dbStore.incrementAiUsage(req.user.id);
    return sendSuccess(res, analysis);
  } catch (err) {
    next(err);
  }
};

const generateChecklist = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400, 'VALIDATION_ERROR');
    }

    const opportunity = await dbStore.getOpportunityById(opportunityId);
    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    const result = await aiService.generateChecklist(opportunity);

    await dbStore.logAiInteraction(
      req.user?.id || null,
      opportunityId,
      'checklist',
      { opportunityId },
      result
    );

    if (req.user) await dbStore.incrementAiUsage(req.user.id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

const copilotChat = async (req, res, next) => {
  try {
    const { opportunityId, question } = req.body;

    if (!question || !question.trim()) {
      return sendError(res, 'A question is required', 400, 'VALIDATION_ERROR');
    }

    let opportunity = null;
    if (opportunityId) {
      opportunity = await dbStore.getOpportunityById(opportunityId);
    }

    if (!opportunity) {
      opportunity = {
        title: 'General Inquiries',
        organization: 'Student Opportunity AI',
        category: 'general',
        description: 'Assisting students in discovering and tracking verified opportunities.'
      };
    }

    let profile = null;
    if (req.user) {
      profile = await dbStore.getProfile(req.user.id);
    }

    const answerData = await aiService.answerQuestion(opportunity, question, profile);

    await dbStore.logAiInteraction(
      req.user?.id || null,
      opportunity.id || null,
      'chat',
      { question },
      answerData
    );

    if (req.user) await dbStore.incrementAiUsage(req.user.id);
    return sendSuccess(res, answerData);
  } catch (err) {
    next(err);
  }
};

const alignCareer = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400, 'VALIDATION_ERROR');
    }

    const opportunity = await dbStore.getOpportunityById(opportunityId);
    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    let profile = null;
    if (req.user) {
      profile = await dbStore.getProfile(req.user.id);
    } else {
      profile = {
        educationLevel: 'Undergraduate',
        major: 'General Studies',
        skills: ['Python', 'JavaScript'],
        interests: ['Technology', 'Learning'],
        careerGoals: 'Entry Level Professional',
        remotePreference: 'flexible'
      };
    }

    const alignmentEngine = require('../services/alignmentEngine');
    const alignmentData = await alignmentEngine.generateAlignment(profile, opportunity);

    await dbStore.logAiInteraction(
      req.user?.id || null,
      opportunityId,
      'career_alignment',
      { opportunityId },
      alignmentData
    );

    if (req.user) await dbStore.incrementAiUsage(req.user.id);
    return sendSuccess(res, alignmentData);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  summarizeOpportunity,
  checkEligibility,
  generateChecklist,
  copilotChat,
  alignCareer,
  
  // Persistent Conversations
  getConversations: async (req, res, next) => {
    try {
      const convs = await dbStore.getConversations(req.user.id);
      return sendSuccess(res, convs);
    } catch (e) { next(e); }
  },

  createConversation: async (req, res, next) => {
    try {
      const { title, opportunityId } = req.body;
      const conv = await dbStore.createConversation(req.user.id, { title, opportunityId });
      return sendSuccess(res, conv, 201);
    } catch (e) { next(e); }
  },

  getConversation: async (req, res, next) => {
    try {
      const conv = await dbStore.getConversation(req.user.id, req.params.id);
      if (!conv) return sendError(res, 'Conversation not found', 404);
      return sendSuccess(res, conv);
    } catch (e) { next(e); }
  },

  deleteConversation: async (req, res, next) => {
    try {
      const success = await dbStore.deleteConversation(req.user.id, req.params.id);
      if (!success) return sendError(res, 'Conversation not found', 404);
      return sendSuccess(res, { deleted: true });
    } catch (e) { next(e); }
  },

  sendMessage: async (req, res, next) => {
    try {
      const { content } = req.body;
      const conversationId = req.params.id;
      if (!content || !content.trim()) return sendError(res, 'Content is required', 400);

      const conv = await dbStore.getConversation(req.user.id, conversationId);
      if (!conv) return sendError(res, 'Conversation not found', 404);

      // Add user message
      await dbStore.addMessage(req.user.id, conversationId, 'user', content);

      // Build context
      let opportunity = null;
      if (conv.opportunityId) {
        opportunity = await dbStore.getOpportunityById(conv.opportunityId);
      }
      const profile = await dbStore.getProfile(req.user.id);
      
      // We will leverage the answerQuestion method and pass history or context.
      const answerData = await aiService.answerQuestion(
        opportunity || { title: 'General Inquiries', category: 'general', description: 'Assisting students in discovering and tracking verified opportunities.' },
        content,
        profile,
        conv.messages
      );

      // Add AI message
      const aiMsg = await dbStore.addMessage(req.user.id, conversationId, 'assistant', answerData.answer);

      await dbStore.logAiInteraction(req.user.id, conv.opportunityId, 'chat_message', { conversationId, content }, answerData);
      await dbStore.incrementAiUsage(req.user.id);

      return sendSuccess(res, aiMsg);
    } catch (e) { next(e); }
  }
};

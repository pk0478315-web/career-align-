const dbStore = require('../data/dbStore');
const roadmapEngine = require('../services/roadmapEngine');
const { sendSuccess, sendError } = require('../utils/response');

const getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let roadmap = await dbStore.getRoadmap(userId);
    
    // If no roadmap exists, we return null or an empty structure, the client will call generate.
    if (!roadmap) {
      return sendSuccess(res, null);
    }
    return sendSuccess(res, roadmap);
  } catch (err) {
    next(err);
  }
};

const generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await dbStore.getProfile(userId);

    if (!profile) {
      return sendError(res, 'Student profile not found. Please complete your profile first.', 404);
    }

    // Generate via AI
    const newRoadmapData = await roadmapEngine.generateRoadmap(profile);
    
    // Persist to DB
    const savedRoadmap = await dbStore.saveRoadmap(userId, newRoadmapData);
    
    return sendSuccess(res, savedRoadmap, 201);
  } catch (err) {
    next(err);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { milestones, progress } = req.body;

    if (!Array.isArray(milestones) || typeof progress !== 'number') {
      return sendError(res, 'Invalid progress data provided', 400);
    }

    const updated = await dbStore.updateRoadmapProgress(userId, { milestones, progress });
    if (!updated) {
      return sendError(res, 'Roadmap not found', 404);
    }

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoadmap,
  generateRoadmap,
  updateProgress
};

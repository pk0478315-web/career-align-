const dbStore = require('../data/dbStore');
const { sendSuccess, sendError } = require('../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await dbStore.getProfile(userId);

    if (!profile) {
      return sendError(res, 'Student profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      displayName,
      university,
      educationLevel,
      major,
      graduationYear,
      skills,
      interests,
      careerGoals,
      preferredLocation,
      remotePreference,
      themePreference
    } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (university !== undefined) updates.university = university;
    if (educationLevel !== undefined) updates.educationLevel = educationLevel;
    if (major !== undefined) updates.major = major;
    if (graduationYear !== undefined) updates.graduationYear = Number(graduationYear);
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : [];
    if (interests !== undefined) updates.interests = Array.isArray(interests) ? interests : [];
    if (careerGoals !== undefined) updates.careerGoals = careerGoals;
    if (preferredLocation !== undefined) updates.preferredLocation = preferredLocation;
    if (remotePreference !== undefined) updates.remotePreference = remotePreference;
    if (themePreference !== undefined) updates.themePreference = themePreference;

    const updatedProfile = await dbStore.updateProfile(userId, updates);

    return sendSuccess(res, updatedProfile);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile
};

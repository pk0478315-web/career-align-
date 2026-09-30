const fs = require('fs');
const path = require('path');
const dbStore = require('../data/dbStore');
const resumeService = require('../services/resumeService');
const { sendSuccess, sendError } = require('../utils/response');

const getResume = async (req, res, next) => {
  try {
    const resume = await dbStore.getResume(req.user.id);
    if (!resume) {
      return sendSuccess(res, null);
    }
    return sendSuccess(res, resume);
  } catch (err) {
    next(err);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const file = req.file;
    if (file.mimetype !== 'application/pdf') {
      fs.unlinkSync(file.path);
      return sendError(res, 'Only PDF files are allowed', 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      return sendError(res, 'File size exceeds 5MB limit', 400);
    }

    // Parse the PDF
    let text;
    try {
      text = await resumeService.parsePdf(file.path);
    } catch (err) {
      fs.unlinkSync(file.path);
      return sendError(res, 'Failed to read PDF file', 500);
    }

    // Cleanup local file immediately after parsing to avoid public exposure / local buildup
    fs.unlinkSync(file.path);

    // Extract structured info
    let extractedData;
    try {
      extractedData = await resumeService.extractResumeInfo(text);
    } catch (err) {
      return sendError(res, 'AI extraction failed', 500);
    }

    // We don't save it as active yet, we return it to frontend for "User Confirmation"
    return sendSuccess(res, {
      fileMetadata: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size
      },
      parsedContent: extractedData
    });

  } catch (err) {
    next(err);
  }
};

const confirmResume = async (req, res, next) => {
  try {
    const { fileMetadata, parsedContent } = req.body;
    const userId = req.user.id;

    if (!fileMetadata || !parsedContent) {
      return sendError(res, 'Missing resume data for confirmation', 400);
    }

    // Save to DB
    const savedResume = await dbStore.saveResume(userId, {
      fileName: fileMetadata.fileName,
      fileType: fileMetadata.fileType,
      fileSize: fileMetadata.fileSize,
      parsedContent
    });

    // Automatically update student profile with merged skills & education
    const profile = await dbStore.getProfile(userId);
    if (profile) {
      const mergedSkills = Array.from(new Set([...(profile.skills || []), ...(parsedContent.skills || [])]));
      
      let educationLevel = profile.educationLevel;
      if (parsedContent.education && parsedContent.education.length > 0) {
        educationLevel = parsedContent.education[0].degree || profile.educationLevel;
      }

      await dbStore.updateProfile(userId, {
        skills: mergedSkills,
        educationLevel
      });
    }

    return sendSuccess(res, savedResume);
  } catch (err) {
    next(err);
  }
};

const alignResume = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    const userId = req.user.id;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400);
    }

    const resume = await dbStore.getResume(userId);
    if (!resume || !resume.parsedContent) {
      return sendError(res, 'No saved resume found. Please upload one first.', 404);
    }

    const opp = await dbStore.getOpportunityById(opportunityId);
    if (!opp) {
      return sendError(res, 'Opportunity not found', 404);
    }

    const alignment = await resumeService.alignResumeWithOpportunity(resume.parsedContent, opp);
    return sendSuccess(res, alignment);
  } catch (err) {
    next(err);
  }
};

const improveResume = async (req, res, next) => {
  try {
    const { opportunityId } = req.body;
    const userId = req.user.id;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400);
    }

    const resume = await dbStore.getResume(userId);
    if (!resume || !resume.parsedContent) {
      return sendError(res, 'No saved resume found. Please upload one first.', 404);
    }

    const opp = await dbStore.getOpportunityById(opportunityId);
    if (!opp) {
      return sendError(res, 'Opportunity not found', 404);
    }

    const improved = await resumeService.improveResume(resume.parsedContent, opp);
    return sendSuccess(res, improved);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResume,
  uploadResume,
  confirmResume,
  alignResume,
  improveResume
};

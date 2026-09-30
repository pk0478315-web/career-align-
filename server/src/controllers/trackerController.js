const dbStore = require('../data/dbStore');
const { sendSuccess, sendError } = require('../utils/response');

const getMyOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const data = await dbStore.getUserOpportunities(userId, status);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

const trackOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId, status, notes, checklist, reminders, appliedDate } = req.body;

    if (!opportunityId) {
      return sendError(res, 'opportunityId is required', 400, 'VALIDATION_ERROR');
    }

    const opportunity = await dbStore.getOpportunityById(opportunityId);
    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }

    const tracked = await dbStore.trackOpportunity(userId, {
      opportunityId,
      status: status || 'saved',
      notes: notes || '',
      checklist: Array.isArray(checklist) ? checklist : [],
      reminders: Array.isArray(reminders) ? reminders : [],
      appliedDate: appliedDate || null
    });

    return sendSuccess(res, tracked, 201);
  } catch (err) {
    next(err);
  }
};

const updateTrackedOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, notes, checklist, reminders, appliedDate } = req.body;

    const validStatuses = [
      'saved',
      'planned',
      'applied',
      'shortlisted',
      'interview',
      'offered',
      'rejected',
      'completed',
      'archived'
    ];

    if (status && !validStatuses.includes(status.toLowerCase())) {
      return sendError(
        res,
        `Invalid status. Valid values: ${validStatuses.join(', ')}`,
        400,
        'INVALID_STATUS'
      );
    }

    const updates = {};
    if (status !== undefined) updates.status = status.toLowerCase();
    if (notes !== undefined) updates.notes = notes;
    if (checklist !== undefined) updates.checklist = checklist;
    if (reminders !== undefined) updates.reminders = reminders;
    if (appliedDate !== undefined) updates.appliedDate = appliedDate;

    const updated = await dbStore.updateUserOpportunity(userId, id, updates);
    if (!updated) {
      return sendError(res, 'Tracked opportunity record not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
};

const deleteTrackedOpportunity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const success = await dbStore.deleteUserOpportunity(userId, id);
    if (!success) {
      return sendError(res, 'Tracked opportunity not found or unauthorized', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyOpportunities,
  trackOpportunity,
  updateTrackedOpportunity,
  deleteTrackedOpportunity
};

const dbStore = require('../data/dbStore');
const notificationService = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Process automated notifications right before fetching (or could be a cron, but doing it here guarantees freshness)
    await notificationService.processUserNotifications(userId);
    
    const notifications = await dbStore.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return sendSuccess(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const success = await dbStore.markNotificationRead(userId, id);
    if (!success) {
      return sendError(res, 'Notification not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id, isRead: true });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const success = await dbStore.markAllNotificationsRead(userId);
    if (!success) {
      return sendError(res, 'Failed to update notifications', 500, 'SERVER_ERROR');
    }

    return sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const prefs = await dbStore.getNotificationPreferences(userId);
    return sendSuccess(res, prefs);
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Fetch current to merge
    const current = await dbStore.getNotificationPreferences(userId);
    const newPrefs = { ...current, ...updates };

    const updated = await dbStore.updateNotificationPreferences(userId, newPrefs);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences
};

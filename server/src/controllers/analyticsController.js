const dbStore = require('../data/dbStore');
const { sendSuccess } = require('../utils/response');

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await dbStore.getAnalytics(req.user.id);
    return sendSuccess(res, analytics);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics
};

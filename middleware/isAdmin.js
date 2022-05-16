const User = require('../models/user');
const errorHandler = require('../util/errorHandler');

// проверка прав админа
module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Not authenticated');
      error.statusCode = 401;
      throw error;
    };
    // если пользователь не админ - выходим
    if (!user.isAdmin) {
      const error = new Error('User not admin');
      error.statusCode = 403;
      throw error; 
    };
    next();
  } catch (err) {
    errorHandler(err, next);
  }
};
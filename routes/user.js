const router = require('express').Router();
const { body } = require('express-validator');

const userControllers = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const multerImages = require('../middleware/multerImages');

// получение информации о пользователе
router.get('/:userId', isAuth, userControllers.getUserData);

// обновление данных о пользователе
router.patch(
  '/:userId', 
  isAuth, 
  multerImages.single('newUserProfileImage'),  
  body('newUserName')
    .trim()
    .isLength({ min: 3 }),
  userControllers.updateUserData
);

module.exports = router;
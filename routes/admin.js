const router = require('express').Router();
const { body } = require('express-validator');

const adminControllers = require('../controllers/admin');
const multerAudio = require('../middleware/multerAudio')
const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/is-auth');

// получение списка пользователей, не являющихся администраторами
router.get('/users', isAuth, isAdmin, adminControllers.getUsers);

// сделать пользователя администратором
router.patch('/users/:userId', isAuth, isAdmin, adminControllers.raiseUser);

// удалить пользователя
router.delete('/users/:userId', isAuth, isAdmin, adminControllers.blockUser);

// создание нового аудио
router.post(
  '/audios', 
  isAuth, 
  isAdmin, 
  multerAudio.single('audio'), [
    body('title')
      .trim()
      .isLength({ min: 3 }),
    body('artist')
      .trim()
      .isLength({ min: 3 }),
    body('imageUrl')
      .isURL()
      .optional({ checkFalsy: true }),
    body('description')
      .trim()
      .isLength({ min: 5 })
  ],
  adminControllers.newAudio);

// обновить аудио
router.put(
  '/audios/:audioId', 
  isAuth, 
  isAdmin, 
  multerAudio.single('audio'), [
    body('title')
      .trim()
      .isLength({ min: 3 }),
    body('artist')
      .trim()
      .isLength({ min: 3 }),
    body('imageUrl')
      .isURL()
      .optional({ checkFalsy: true }),
    body('description')
      .trim()
      .isLength({ min: 5 })
  ],
  adminControllers.updateAudio
);

// удалить аудио
router.delete('/audios/:audioId', isAuth, isAdmin, adminControllers.deleteAudio);

module.exports = router;
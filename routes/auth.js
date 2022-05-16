const router = require('express').Router();
const { body } = require('express-validator');

const authControllers = require('../controllers/auth');

// регистрация пользователя
router.put("/signup", [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric(),
  body('name')
    .trim()
    .isLength({ min: 3 })
], authControllers.signup); 

// авторизация пользователя
router.post('/login',
[
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric(),
], authControllers.login);

module.exports = router;
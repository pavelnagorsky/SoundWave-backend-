const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const jwtConfig = require('../config/jwtToken');
const errorHandler = require('../util/errorHandler');
const checkValidity = require('../util/checkValidity');

// регистрация
exports.signup = async (req, res, next) => {
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    // проверка существования емэйла
    let existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      const error = new Error('E-Mail already exists. Please, try a different one.');
      error.statusCode = 401; // no authenticated
      throw error;
    }
    // зашифровка пароля
    const hashedPw = await bcrypt.hash(password, 12);
    // создание нового пользователя
    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });
    const savedUser = await user.save();
    res.status(201).json({
      message: "User created!",
      userId: savedUser._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// авторизация
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    // проверка валидации
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('No user with this email found.');
      error.statusCode = 401; // no authenticated
      throw error;
    };
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is incorrect.');
      error.statusCode = 401; // no authenticated
      throw error;
    };
    const token = jwtConfig({
      email: user.email,
      _id: user._id
    });
    const expirationDate = 24 * 3600000; // token lifetime (24h)
    res.status(200).json({
      token: token,
      expiresIn: expirationDate,
      userId: user._id.toString()
    });
  } catch (err) {
    errorHandler(err, next);
  }
}
const { validationResult } = require('express-validator');

const User = require('../models/user');
const errorHandler = require('../util/errorHandler');
const checkValidity = require('../util/checkValidity');
const deleteFile = require('../util/deleteFile');

// получение информации о конкретном пользователе
exports.getUserData = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId)
      .populate({
        path: 'playlists',
        populate: {
          path: 'author',
          select: ['name']
        }
      });
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'user data successfully fetched',
      userData: user.toJSON()
    });
    
  } catch (err) {
    errorHandler(err, next);
  }
};

// обновление данных о пользователе
exports.updateUserData = async (req, res, next) => {
  const newName = req.body.newUserName;
  const newProfileImage = req.file;
  let updatedName = null;
  let updatedProfileImage = null;
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    // если было изменено имя пользователя - обновляем
    if (newName !== 'null') {
      user.name = newName;
      updatedName = user.name;
    };
    // если была изменена аватарка пользователя - обновляем ссылку на файл
    if (newProfileImage) {
      // удаляем старую аватарку
      deleteFile(user.profileImage);
      // обновляем на новую
      user.profileImage = newProfileImage.path.replace(/[\\]/g, '/');
      updatedProfileImage = user.profileImage;
    };
    await user.save();
    res.status(200).json({
      message: 'user data successfully updated',
      updatedName: updatedName,
      updatedProfileImage: updatedProfileImage
    })
  } catch (err) {
    errorHandler(err, next);
  }
};


const { validationResult } = require('express-validator');

const User = require('../models/user');
const Audio = require('../models/audio');
const Playlist = require('../models/playlist');
const Comment = require('../models/comment');
const Category = require('../models/category');
const deleteFile = require('../util/deleteFile'); 
const errorHandler = require('../util/errorHandler');
const checkValidity = require('../util/checkValidity');

// получение списка пользователей, не являющихся администраторами
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User
      .find({ 'isAdmin': false })
      .select(["_id", "name", "email", "isAdmin"]);
    res.status(200).json({
      message: "non-admin users successfully fetched",
      users: users
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// сделать пользователя администратором
exports.raiseUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    user.isAdmin = true;
    const savedUser = await user.save();
    res.status(200).json({
      message: "new admin created",
      id: savedUser._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// удалить пользователя
exports.blockUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    // удаление всех плейлистов пользователя
    await Playlist.deleteMany({
      _id: {
        $in: deletedUser.playlists
      }
    })
    res.status(200).json({
      message: "user successfully deleted",
      id: deletedUser._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// создание нового аудио
exports.newAudio = async (req, res, next) => {
  // валидация ввода
  const errors = validationResult(req);
  const validationErr = checkValidity(errors);
  if (validationErr) throw validationErr;

  const title = req.body.title;
  const artist = req.body.artist;
  const genre = req.body.category;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  try {
    if (!req.file) {
      const error = new Error('No file attached');
      error.statusCode = 415;
      throw error;
    };
    const audioUrl = req.file.path.replace(/[\\]/g, '/');
    const category = await Category.findOne({ genre: genre });
    if (!category) {
      const error = new Error(`Category ${genre} not exist`);
      error.statusCode = 404;
      throw error;
    };
    const audio = new Audio({
      title: title,
      audioUrl: audioUrl,
      artist: artist,
      description: description,
      category: category
    });
    // если была введена ссылка на обложку аудиотрека
    if (imageUrl.trim() !== "") {
      audio.imageUrl = imageUrl;
    };
    const savedAudio = await audio.save();
    res.status(201).json({
      message: "Audio created successfully!",
      audio: savedAudio.toJSON()
    });
  } catch (err) {
    errorHandler(err, next)
  }
};

// обновление аудио
exports.updateAudio = async (req, res, next) => {
  // валидация ввода
  const errors = validationResult(req);
  const validationErr = checkValidity(errors);
  if (validationErr) throw validationErr;

  const audioId = req.params.audioId;
  const newTitle = req.body.title;
  const newArtist = req.body.artist;
  const newGenre = req.body.category;
  const newImageUrl = req.body.imageUrl;
  const newDescription = req.body.description;
  try {
    // поиск существующего аудио
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('No audio found');
      error.statusCode = 404;
      throw error;
    };
    // поиск сущестования обновленной категории аудио
    const category = await Category.findOne({ genre: newGenre });
    if (!category) {
      const error = new Error(`Category ${newGenre} not exist`);
      error.statusCode = 404;
      throw error;
    };
    // если изменен аудио файл
    if (req.file) {
      // удаляем старый
      deleteFile(audio.audioUrl);
      // обновляем ссылку
      audio.audioUrl = req.file.path.replace(/[\\]/g, '/');
    };
    // обновляем остальные поля модели аудио
    audio.title = newTitle;
    audio.artist = newArtist;
    audio.imageUrl = newImageUrl;
    audio.category = category;
    audio.description = newDescription;
    // сохраняем обновленное аудио
    const savedAudio = await audio.save();
    res.status(200).json({
      message: "Audio updated successfully!",
      id: savedAudio._id
    });
  } catch (err) {
    errorHandler(err, next)
  }
};

// удаление аудио
exports.deleteAudio = async (req, res, next) => {
  const audioId = req.params.audioId;
  try {
    const deletedAudio = await Audio.findByIdAndDelete(audioId);
    if (!deletedAudio) {
      const error = new Error('No audio found');
      error.statusCode = 404;
      throw error;
    };
    // удаление комментариев к аудио
    await Comment.deleteMany({
      _id: {
        $in: deletedAudio.comments
      }
    });
    // удаление аудиофайла
    deleteFile(deletedAudio.audioUrl);
    res.status(200).json({
      message: "audio successfully deleted",
      id: deletedAudio._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

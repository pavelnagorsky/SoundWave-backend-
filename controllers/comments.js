const { validationResult } = require('express-validator');

const Audio = require('../models/audio');
const User = require('../models/user');
const Comment = require('../models/comment'); 
const checkValidity = require('../util/checkValidity');
const errorHandler = require('../util/errorHandler');

// создание нового комментария
exports.newComment = async (req, res, next) => {
  const audioId = req.params.audioId;
  const commentText = req.body.comment;
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    // проверка существования аудио
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    };
    // получение данных о создателе комментария
    const user = await User.findById(req.userId)
      .select(['_id', 'name', 'profileImage']);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    // создаем новый комментарий
    const comment = new Comment({
      text: commentText,
      author: user
    });
    const newComment = await comment.save();
    // добавляем комментарий к моделе аудиозаписи
    audio.comments.unshift(newComment);
    await audio.save();
    // отправка нового комментария
    res.status(201).json({
      mesage: 'Comment successfully created',
      comment: newComment.toJSON()
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// обновление комментария
exports.updateComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    // получение информации о пользователе (админ или нет)
    const user = await User.findById(req.userId).select("isAdmin");
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    };
    // проверка существования комментария
    const comment = await Comment.findById(commentId)
      .populate('author', ['_id', 'name', 'profileImage']);
    if (!comment) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    };
    // если комментарий не принадлежит пользователю
    if (comment.author._id.toString() !== req.userId.toString() && !user.isAdmin) {
      const error = new Error('Forbidden action.');
      error.statusCode = 403;
      throw error;
    };
    // обновляем комментарий
    comment.text = req.body.comment;
    const updatedComment = await comment.save();
    // возвращаем обновленный комментарий
    res.status(200).json({
      mesage: 'Comment successfully updated',
      comment: updatedComment.toJSON()
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// удаление комментария
exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const audioId = req.params.audioId;
  try {
    // проверка существования аудиозаписи
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    };
    // удаляем комментарий
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    // удаляем комментарий из модели аудиозаписи
    const updatedComments = audio.comments.filter(comment => {
      return comment._id.toString() !== deletedComment._id.toString()
    });
    audio.comments = updatedComments;
    await audio.save();
    // отправка нового комментария
    res.status(200).json({
      mesage: 'Comment successfully deleted',
      commentId: deletedComment._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};
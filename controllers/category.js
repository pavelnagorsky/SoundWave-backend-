const { validationResult } = require('express-validator');

const errorHandler = require('../util/errorHandler');
const checkValidity = require('../util/checkValidity');
const Category = require('../models/category');

// получение всех категорий
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      const error = new Error('No categories found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'categories successfully fetched',
      categories: categories
    });
    
  } catch (err) {
    errorHandler(err, next);
  }
};

// создание новой категории
exports.createNewCategory = async (req, res, next) => {
  const genre = req.body.genre;
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    const newCategory = new Category({
      genre: genre
    });
    const savedCategory = await newCategory.save();
    res.status(201).json({
      message: 'category successfully created',
      category: savedCategory.toJSON()
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// обновление существующей категории
exports.updateCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const newGenre = req.body.genre;
  try {
    // валидация ввода
    const errors = validationResult(req);
    const validationErr = checkValidity(errors);
    if (validationErr) throw validationErr;

    // поиск редактируемой категории
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error('No category found');
      error.statusCode = 404;
      throw error;
    };
    // обновление названия
    category.genre = newGenre;
    const savedCategory = await category.save();
    res.status(200).json({
      message: 'category successfully updated',
      category: savedCategory.toJSON()
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// удаление категории
exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    // поиск и удаление существующей категории
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      const error = new Error('No category found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'category successfully deleted',
      id: deletedCategory._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};
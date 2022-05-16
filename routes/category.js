const router = require('express').Router();
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/isAdmin');
const categoryControllers = require('../controllers/category');

// получение всех категорий
router.get("/", categoryControllers.getCategories); 

// создание новой категории
router.put(
  "/", 
  isAuth, 
  isAdmin, 
  body('genre')
    .trim()
    .isLength({ min: 2 }),
  categoryControllers.createNewCategory
);

// обновление категории
router.patch(
  "/:categoryId", 
  isAuth, 
  isAdmin, 
  body('genre')
    .trim()
    .isLength({ min: 2 }),
  categoryControllers.updateCategory
);

// удаление категории
router.delete("/:categoryId", isAuth, isAdmin, categoryControllers.deleteCategory);

module.exports = router;
const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');
const commentsControllers = require('../controllers/comments');

// создание нового комментария
router.post(
  "/", 
  isAuth, 
  body('comment')
    .trim()
    .isLength({ min: 1 }),
  commentsControllers.newComment
); 

// обновление комментария
router.patch(
  "/:commentId", 
  isAuth, 
  body('comment')
    .trim()
    .isLength({ min: 1 }),
  commentsControllers.updateComment
); 

// удаление комментария
router.delete("/:commentId", isAuth, commentsControllers.deleteComment); 

module.exports = router;
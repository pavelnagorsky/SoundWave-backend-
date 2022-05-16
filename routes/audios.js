const router = require('express').Router();

const audioControllers = require('../controllers/audio');
const isAuth = require('../middleware/is-auth');

// получение всех аудио
router.get('/', audioControllers.getAudios);

// получение полной информации об аудио
router.get('/:audioId', audioControllers.getAudio);

// скачать аудио
router.get('/:audioId/download', audioControllers.downloadAudio);

// изменить счетчик лайков на аудиозаписи
router.patch('/:audioId/like', isAuth, audioControllers.updateLike);

// поиск аудио через строку поиска
router.post('/search', audioControllers.search);

// изменить счетчик прослушиваний на аудиозаписи
router.patch('/:audioId/plays', audioControllers.updatePlays);

module.exports = router;
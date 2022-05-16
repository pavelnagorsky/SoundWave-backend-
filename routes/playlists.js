const router = require('express').Router({ mergeParams: true });

const playlistsControllers = require('../controllers/playlists');
const isAuth = require('../middleware/is-auth');

// добавление аудио в плейлист
router.post('/:playlistId', isAuth, playlistsControllers.addAudioToPlaylist);

// удаление аудио из плейлиста
router.patch('/:playlistId', isAuth, playlistsControllers.deleteAudioFromPlaylist);

// создание нового плейлиста
router.put('/', isAuth, playlistsControllers.addPlaylist);

// удаление плейлиста
router.delete('/:playlistId', isAuth, playlistsControllers.deletePlaylist);

// получение аудио с плейлиста
router.get('/:playlistId', isAuth, playlistsControllers.getPlaylist);

module.exports = router;
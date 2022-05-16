const User = require('../models/user');
const Audio = require('../models/audio');
const Playlist = require('../models/playlist');
const errorHandler = require('../util/errorHandler');

// добавление аудио в плейлист
exports.addAudioToPlaylist = async (req, res, next) => {
  const audioId = req.body.audioId;
  const playlistId = req.params.playlistId;
  try {
    // находим нужные плейлист и аудио
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      const error = new Error('No playlist found');
      error.statusCode = 404;
      throw error;
    };
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('No audio found');
      error.statusCode = 404;
      throw error;
    };
    // если аудио с таким id уже были в плейлисте - удаляем их
    playlist.music = playlist.music.filter(id => {
      return id.toString() !== audioId.toString()
    });
    // добавляем аудио в массив плейлиста
    playlist.music.unshift(audio);
    await playlist.save();
    res.status(201).json({
      message: 'audio successfully added to playlist',
      audioId: audioId,
      playlistId: playlistId
    })
  } catch (err) {
    errorHandler(err, next);
  }
};

// удаление аудио из плейлиста
exports.deleteAudioFromPlaylist = async (req, res, next) => {
  const audioId = req.body.audioId;
  const playlistId = req.params.playlistId;
  try {
    // находим плейлист 
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      const error = new Error('No playlist found');
      error.statusCode = 404;
      throw error;
    };
    // проверка автора плейлиста
    if (playlist.author.toString() !== req.userId.toString()) {
      const error = new Error('You are not the creator of this playlist');
      error.statusCode = 403;
      throw error;
    };
    // удаление аудио из плейлиста
    playlist.music = playlist.music.filter(audio => {
      return audio.toString() !== audioId.toString()
    });
    await playlist.save();
    res.status(200).json({
      message: 'Playlist successfully changed',
      deletedAudioId: audioId,
      playlistId: playlist._id
    })
  } catch (err) {
    errorHandler(err, next);
  }
};

// создание нового плейлиста
exports.addPlaylist = async (req, res, next) => {
  // название плейлиста
  const playlistTitle = req.body.playlistTitle;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    const playlist = new Playlist({
      author: user._id,
      title: playlistTitle
    });
    const newPlaylist = await playlist.save();
    // вставляем новый плейлист в массив плейлистов пользователя
    user.playlists.unshift(newPlaylist);
    await user.save();
    // перед отправкой плейлиста клиенту извлекаем имя его создателя
    await newPlaylist.populate({
      path: 'author',
      select: ['name']
    });
    res.status(201).json({
      message: 'new playlist successfully created',
      playlist: newPlaylist.toJSON()
    })
  } catch (err) {
    errorHandler(err, next);
  };
};

// удаление плейлиста
exports.deletePlaylist = async (req, res, next) => {
  const playlistId = req.params.playlistId;
  try {
    // находим пользователя и его плейлист
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      throw error;
    };
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      const error = new Error('No playlist found');
      error.statusCode = 404;
      throw error;
    };
    // проверка автора плейлиста
    if (playlist.author.toString() !== user._id.toString()) {
      const error = new Error('You are not the creator of this playlist');
      error.statusCode = 403;
      throw error;
    };
    // удаление плейлиста
    const deletedPlaylist = await playlist.delete();
    // удаление плейлиста из массива плейлистов пользователя
    user.playlists = user.playlists.filter(pl => {
      return pl._id.toString() !== deletedPlaylist._id.toString()
    });
    await user.save();
    res.status(200).json({
      message: 'playlist successfully deleted',
      deletedPlaylistId: deletedPlaylist._id
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// получение аудио с плейлиста
exports.getPlaylist = async (req, res, next) => {
  const playlistId = req.params.playlistId;
  try {
    const playlist = await Playlist
      .findById(playlistId)
      .populate({ 
        path: 'music',
        // не включаем лишнюю информацию о аудио
        select: {
          description: 0, 
          imageUrl: 0,
          comments: 0
        }
      });
    if (!playlist) {
      const error = new Error('No playlist found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'playlist successfully fetched',
      audios: playlist.music,
      totalAudios: playlist.music.length
    })
  } catch (err) {
    errorHandler(err, next);
  }
};
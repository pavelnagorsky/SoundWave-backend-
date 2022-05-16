const fs = require('fs');
const path = require('path');

const Audio = require('../models/audio');
const Category = require('../models/category');
const User = require('../models/user');
const errorHandler = require('../util/errorHandler');

// получение всех аудио
exports.getAudios = async (req, res, next) => {
  // переменные для пагинации
  let perPage = +process.env.PER_PAGE || 10;
  let currentPage = +req.query.page || 1;
  
  let findQuery = {}; // объект для поиска mongoose query.find()
  let sortQuery = { createdAt: -1 }; // объект для сортировки mongoose query.sort()
  const searchQuery = req.query.sort; // параметр сортировки
  isSearchByGenre = true; // bolean значение, происходит ли сортировка по жанрам или plays/likes
  // для подборок по кол-ву прослушиваний или лайков 
  // отбираем только аудио с соответсвующими значениями >= 1
  if (searchQuery) {
    if (searchQuery === 'Most Listened') {
      findQuery = {
        plays: { $gte: 1 }
      };
      sortQuery = { plays: -1 }; // кол-во прослушиваний по убыванию
      isSearchByGenre = false;
    } else if (searchQuery === 'Top Rated') {
      findQuery = {
        likes: { $gte: 1 }
      };
      sortQuery = { likes: -1 }; // кол-во лайков по убыванию
      isSearchByGenre = false;
    };
  };
  try {
    // если требуется подборка по жанру
    if (searchQuery && isSearchByGenre) {
      const category = await Category.findOne({ genre: searchQuery });
      if (!category) {
        const error = new Error(`Category ${searchQuery} not found`);
        error.statusCode = 404;
        throw error;
      };
      // находим _id нужной категории и по ней ищем аудио
      const categoryId = category._id;
      findQuery = {
        category: categoryId
      };
    };
    // подсчет общего количества аудио для пагинации
    const totalAudios = await Audio
      .find(findQuery)
      .sort(sortQuery)
      .countDocuments();
    // если req.query.sort отсутсвует, то возвращаем все аудио 
    // с сортировкой по дате добавления
    const audios = await Audio.find(findQuery)
      // убираем лишнюю информацию
      .select({ 
        description: 0, 
        imageUrl: 0,
        comments: 0
      })
      .sort(sortQuery)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
    if (!audios) {
      const error = new Error('No audios found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'Posts successfully fetched',
      totalAudios: totalAudios,
      audios: audios
    })
  } catch (err) {
    errorHandler(err, next);
  }
};

// получение одной аудиозаписи с полной информацией
exports.getAudio = async (req, res, next) => {
  const audioId = req.params.audioId;
  try {
    const audio = await Audio
      .findById(audioId)
      .populate('category')
      // извлекаем нужные для комментария данные о его создателе
      .populate({ 
        path: 'comments', 
        populate: {
          path: 'author',
          select: ['_id', 'name', 'profileImage']
        }
      });
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    };
    res.status(200).json({
      message: 'Audio successfully fetched',
      audio: audio
    })
  } catch (err) {
    errorHandler(err, next);
  }
};

// скачать аудио
exports.downloadAudio = async (req, res, next) => {
  const audioId = req.params.audioId;
  try {
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    }; 	
    const audioPath = path.join(audio.audioUrl);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.download(audioPath);
  } catch (err) {
    errorHandler(err, next);
  }
};

// добавление или удаление лайка к аудиозаписи
exports.updateLike = async (req, res, next) => {
  const userId = req.userId;
  const audioId = req.params.audioId;
  const addLike = req.body.add;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    };
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    };
    // добавление или удаление аудиозаписи 
    // из массива лайков пользователя и
    // изменение счетчика лайков у данной аудиозаписи
    if (addLike) { 
      user.likes.push(audioId);
      audio.likes += 1;
    } else {
      let userLikes = user.likes.filter(audio_id => audio_id.toString() !== audioId);
      user.likes = userLikes;
      if (audio.likes > 0) {
        audio.likes -= 1;
      }
    };
    await user.save();
    await audio.save();
    res.status(200).json({
      message: "Audio updated successfully!",
      _id: audioId
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// обновление счетчика прослушиваний
exports.updatePlays = async (req, res, next) => {
  const audioId = req.params.audioId;
  try {
    const audio = await Audio.findById(audioId);
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      throw error;
    };
    audio.plays += 1;
    await audio.save();
    res.status(200).json({
      message: `Successfully increased plays to ${audio.plays}`
    });
  } catch (err) {
    errorHandler(err, next);
  }
};

// поиск аудиозаписей по названию и автору
exports.search = async (req, res, next) => {
  // переменные для пагинации
  let perPage = +process.env.PER_PAGE || 3;
  let currentPage = +req.query.page || 1;

  let searchQuery = req.body.searchQuery;
  // заменяем пробелы на |
  searchQuery = searchQuery.replace(/\s/g, '|');
  // создаём регулярное выражение на основе текстовой переменной, 
  // экранируя для неё все зарезервированные символы RegExp
  // кроме символа | и добавляем флаг регистронезависимости i.
  // теперь метод .test() будет возвращать true, если хоть одно из 
  // значений между знаками | совпадёт 
  const query = new RegExp(`${searchQuery.replace(/[-\/\\^$*+?.()[\]{}]/g,'\\$&')}`, 'i');
  try {
    // находим аудиозаписи, где любое из поисковых слов 
    // встречается в title или artist полях аудиозаписи
    const totalAudios = await Audio
      .find({
        $or: [{ title: query }, { artist: query }]
      })
      .countDocuments();
    const audios = await Audio
      .find({
        $or: [{ title: query }, { artist: query }]
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      // убираем лишнюю информацию
      .select({ 
        description: 0, 
        imageUrl: 0,
        comments: 0
      })
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: 'successfully found audios',
      audios: audios,
      totalAudios: totalAudios
    });
  } catch (err) {
    errorHandler(err, next);
  }
};
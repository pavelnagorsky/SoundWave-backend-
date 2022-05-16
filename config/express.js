// express config
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
require('dotenv').config();

const headers = require('../middleware/headers');
const audiosRoutes = require('../routes/audios');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const playlistsRoutes = require('../routes/playlists');
const categoryRoutes = require('../routes/category');
const commentsRoutes = require('../routes/comments');
const adminRoutes = require('../routes/admin');

const app = express();

module.exports = () => {
  // data parser config
  app.use(bodyParser.json());

  // headers config
  app.use(headers);

  // optimization
  app.use(compression());

  // static dirs
  app.use("/images", express.static('images'));
  app.use("/music", express.static('music'));

  // routes
  app.use('/audios', audiosRoutes);
  app.use('/audios/:audioId/comments', commentsRoutes);
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  app.use('/user/:userId/playlists', playlistsRoutes);
  app.use('/category', categoryRoutes);
  app.use('/admin', adminRoutes);
  
  // error handling
  app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message || 'Some server-side error occured';
    res.status(status).json({ message: message });
  });

  return app;
};

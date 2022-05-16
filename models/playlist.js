const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const playlistShema = new Schema({
  title: {
		type: String,
		required: true
	},
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  music: [{
    type: Schema.Types.ObjectId,
    ref: 'Audio'
  }]
}, { timestamps: true });

module.exports = Mongoose.model("Playlist", playlistShema);
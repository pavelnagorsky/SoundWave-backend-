const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const audioShema = new Schema({
  title: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: "http://cdn.onlinewebfonts.com/svg/img_433329.png"
  },
  artist: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
	}],
  likes: {
    type: Number,
    default: 0
  },
  plays: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = Mongoose.model("Audio", audioShema);
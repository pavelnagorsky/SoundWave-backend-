const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const userShema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: "images/user-no-image.jpg"
  },
  name: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  playlists: [{
    type: Schema.Types.ObjectId,
    ref: "Playlist"
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "Audio"
  }]
}, { timestamps: true });

module.exports = Mongoose.model("User", userShema);
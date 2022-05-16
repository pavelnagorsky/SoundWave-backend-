const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const categoryShema = new Schema({
  genre: {
    type: String,
    required: true
  }
});

module.exports = Mongoose.model("Category", categoryShema);
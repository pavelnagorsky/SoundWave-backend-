const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const commentShema = new Schema({
  text: {
		type: String,
		required: true
	},
  author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, { timestamps: true });

module.exports = Mongoose.model("Comment", commentShema);
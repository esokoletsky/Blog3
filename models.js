'use strict'

const mongoose = require("mongoose");

const blogsSchema = mongoose.Schema({
	tittle: { type: String, required: true},
	content: { type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	}
});

blogsSchema.virtual("fullName").get(function() {
	return `${this.author.firstName} ${this.author.lastName}`
});

blogsSchema.methods.serialize = function() {
	return {
		id: this._id,
		tittle: this.tittle,
		content: this.content,
		author: this.author
	};
}; //Why semicolon

const BlogPosts = mongoose.model("BlogPosts", blogsSchema);

module.exports = { BlogPosts };
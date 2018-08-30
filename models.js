'use strict'

const mongoose = require("mongoose");

const blogsSchema = mongoose.Schema({
	title: { type: String, required: true},
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
		title: this.title,
		content: this.content,
		author: this.fullName
	};
}; //Why semicolon

const BlogPosts = mongoose.model("BlogPost", blogsSchema);

module.exports = { BlogPosts };
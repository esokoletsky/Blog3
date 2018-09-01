'use strict'

const mongoose = require("mongoose");

let authorSchema = mongoose.Schema({
	firstName: "string",
	lastName: "string",
	userName: {
		type: "string"
		unique: true
	}	
});

let commentSchema = mongoose.Schema({ content: "string" });

let blogPostSchema = mongoose.Schema({
	title: "string",
	content: "string",
	author: {  }
})

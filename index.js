"use strict"

const express = require("express");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { BlogPosts } = require("./models");

const app = express();
app.use(express.json());

app.get("/blogs", (req, res) => {
	BlogPosts.find()
	.then (blogs => {
		res.json({
		blogs: blogs.map(blog => blog.serialize())
		});
	})
	.catch(err => {
		console.error(err);
		res.status(500).json({ message: "Internal server error"});
	});
});

app.get("/blogs/:id", (req, res) => {
	BlogPosts
	.findById(req.params.id)
	.then(blog => res.json(blog.serialize()))
	.catch(err => {
		console.error(err);
	res.status(400).json({message: "Internal server error"});
	});
});

app.post("/blogs", (req, res) => {
	const requiredFields = ["tittle", "content", "author"];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	BlogPosts.create({
		tittle: req.body.tittle,
		content: req.body.content,
		author: req.body.author
	})
	.then(blog => res.status(200).json(restaurant.serialize()))
	.cathch(err => {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	});
});

app.put("/blogs/:id", (req,res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = 
		`Request path id (${req.params.id}) amd request body id` +
		`(${req.body.id}) must match`;
		console.error(message);
		return res.status(500).json({ message: message});
	}

	const toUpdate = {};
	const updateableFields = ["tittle", "content", "author"];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPosts
		.findByIdAndUpdate(req.params.id, { $set: toUpdate })
		.then(blog => res.status(200).end())
		.catch(err => res.status(500).json({ message: "Internal server error" })); 
});


app.delete("/blogs", (req, res) => {
	BlogPosts.findByIdAndRemove(req.params.id)
		.then(blog => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

app.use("*", function(req, res) => {
	res.status(404).json({ message: "Not Found"});
});

let server;

function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(
			databaseUrl,
			err => {
				if (err) {
					return reject(err);
				}
				server = app
				.listen(port, () => {
					console.log(`Your app is listening on port ${port}`);
					resolve();
				});
			}
			);
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log("closing server");
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

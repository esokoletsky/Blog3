"use strict"

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { Authors, BlogPosts } = require("./models");

const app = express();

app.use(express.json());
app.use(morgan("common"));

app.get("/authors", (req, res) => {
	Authors
		.find()
		.then (authors => {
			res.json(authors.map(author => {
				return {
					id: author._id,
					name: `${author.firstName} ${author.lastName}`,
					userName: author.userName
				};
			}));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "Something went wrong" });
		});
});

app.post("/authors", (req, res) => {
	const requiredFields = ["firstName", "lastName", "userName"];
	requiredFields.forEach(field => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message)
		}
	});

	Authors
		.findOne({ userName: req.body.userName })
		.then(author => {
			if (author) {
				const message = "Username already taken";
				console.error(message);
				return res.status(400).send(message);
			}
			else {
				Authors
					.create({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						userName: req.body.userName
					})
			.then(author => res.status(201).json({
				_id: author.id,
				name: `${author.firstName} ${author.lastName}`,
				userName: author.Username
			}))
			.catch(err => {
				console.error(err);
				res.status(500).json({ error: "Something went wrong" });
			});
			}

		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "Something went horribly wrong"});
		});
});


app.put("/authors/:id", (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		res.status(400).json({
			error: "Request path id and request body id values must match"
		});
	}

	const updated = {};
	const updateableFields = ["firstName", "lastName", "userName"];
	updateableFields.forEach(field => {
		if(field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Authors
		.findOne({ userName: updated.userName || "", _id: { $ne: req.params.id } })
		.then(author => {
			if(author) {
				const message = "Username already taken";
				console.error(message);
				return res.status(400).send(message);
			}
			else {
				Authors
					.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
					.then(updatedAuthor => {
						res.status(200).json({
							id: updatedAuthor.id,
							name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
							userName: updatedAuthor.username
						});
					})
					.catch(err => res.status(500).json({ message: err }));
			}
		});
});	

app.delete("/authors/:id", (req, res) => {
	BlogPosts
		.remove({ author: req.params.id })
		.then(() => {
			Authors
			.findByIdAndRemove(req.params.id)
			.then(() => {
				console.log(`Dleted blog posts owned by and author with id ${req.params.id}`);
				res.status(204).json({ message: "success" });
		});
})
	.catch(err => {
		console.error(err);
		res.status(500).json({ error: "something went terribly wrong" });
	});
});

app.get("/posts", (req, res) => {
	BlogPosts
		.find()
		.then(posts => {
			res.json(posts.map(post => {
				return {
					id: post._id,
					author: post.authorName,
					content: post.content,
					title: post.title
				};
			}));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "something went really wrong" })
		});

});

app.get("/posts/:id", (req, res) => {
	BlogPosts
		.findById(req.params.id)
		.then(post => {
			res.json({
				id: post._id,
				author: post.authorName,
				content: post.content,
				title: post.title,
				comments: post.comments
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "something went horribly wrong" });
		});
});

app.post("/posts", (req, res) => {
	const requiredFields = ["title", "content", "author_id"];
	requiredFields.forEach(field => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in in request`;
			console.error(message);
			return res.status(400).send(message);
		}
	});

	Authors
		.findById(req.body.author_id)
		.then(author => {
			if (author) {
				BlogPosts
					.create({
						title: req.body.title,
						content: req.body.content,
						author: req.body.id
					})
					.then(blogPosts => res.status(201).json({
						id: blogPosts.id,
						author: `${author.firstName} ${author.lastName}`,
						content: blogPosts.content,
						title: blogPosts.title,
						comments: blogPosts.comments 
					}))
					.catch(err => {
						console.error(err);
						res.status(500).json({ error: "something went wrong" });
					});
			}
			else {
				const message = "Author not found";
				console.error(message);
				return res.status(400).send(message);
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "something went horribly wrong" });

		});

});

app.put("/posts/:id", (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		res.status(400).json({
			error: "Request path id and request body id values must match"
		});
	}
	const updates = {};
	const updateableFields = ["title", "content"];
	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	BlogPosts
		.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
		.then(updatedPost => res.status(200).json({
			id: updatedPost.id,
			title: updatedPost.title,
			content: updatedPost.content
		}))
		.catch(err => res.status(500).json({ message: err }));
});

app.delete("/posts/:id", (req, res) => {
	BlogPosts
		.findByIdAndRemove(req.params.id)
		.then(() => {
			console.log(`Dleted blog post with id ${req.params.id}`);
			res.stat(204).end();
		});
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

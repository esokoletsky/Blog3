"use strict"

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan")

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { BlogPosts } = require("./models");

const app = express();
app.use(express.json());

app.get("/authors", (req, res) => {
	Author 
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
.ctach(err => {
	console.error(err);
	res.status(500).json({ error: "something went wrong" });
	});
});

app.post("/authors", (req, res) => {
	const requiredFileds = [""]
})




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

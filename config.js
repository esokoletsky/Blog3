"use strict"
exports.DATABASE_URL = "mongodb://esokoletsky:deskjet11@ds145752.mlab.com:45752/blog3"
process.env.DATABASE_URL = "mongodb://localhost/blog-app";
exports.PORT = process.env.PORT || 8080;
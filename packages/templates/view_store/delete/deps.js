const { remove } = require("@blossm/mongodb-database");
const { badRequest } = require("@blossm/errors");

exports.db = { remove };
exports.badRequestError = badRequest;

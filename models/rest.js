var mongoose = require("mongoose");

var RestSchema = mongoose.Schema({
	id: String,
	name: String,
	url: String,
	image_url: String,
	goingCount: Number,
	goingId: [String]
});

var Rest = module.exports = mongoose.model("Rest", RestSchema);

// returns the restaurant with the given id
module.exports.getRestById = (id, callback) => {
	let query = {id: id};
	Rest.findOne(query, callback);
}

// Adds the given restaurant to the database
module.exports.addRest = (newRest, callback) => {
	newRest.save(callback);
}
var mongoose = require("mongoose");

// authentication using twitter API
var UserSchema = mongoose.Schema({
	id: String,
	username: String,
	name: String,
	going: [{"res_id": String, "res_name": String}]
});

var User = module.exports = mongoose.model("User", UserSchema);

// registers a new user to the database
module.exports.registerUser = function(newUser, callback) {
	newUser.save(callback);
}

// returns the user with the specified username
module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
}
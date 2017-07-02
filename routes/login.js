var express = require("express");
var router = express.Router();
var passport = require("passport");
var TwitterStrategy = require("passport-twitter");
var User = require("../models/user");

passport.use(new TwitterStrategy({
	consumerKey: "enSaGuXrIZHK7xZ3S1MJ1Y4Xf",
	consumerSecret: "Vhc0o0QDqWjSsFAmIGuWjVHeyohQhlQKsQtTzQHFsjURiQdShr",
	callbackURL: "/login/authenticate"
}, (token, tokenSecret, profile, callback) => {
	
	let id = profile.id;
	let username = profile.username;
	let name = profile["displayName"];

	User.getUserByUsername(username, (err, user) => {
		if (err) throw err;

		// if user not already present, register user
		if (!user) {
			let newUser = new User({
				id: id,
				username: username,
				name: name
			});
			
			User.registerUser(newUser, (err, user) => {
				if (err) throw err;
				console.log("REGISTERED");
				console.log(user);
			});
			return callback(null, newUser);
		}
		else {
			return callback(null, user);
		}

	});
}));

passport.serializeUser((user, callback) => {
	callback(null, user);
});
// 266485579-xzmIRcngtbmoxAHl6yZNcxQdltpT4fi8W0Znnjvp RtBwGiVDgl8UwShAghttjbK0DFSQsEs97y9aQIZT4Snr7 

passport.deserializeUser((obj, callback) => {
	callback(null, obj);
});

router.get("/", passport.authenticate("twitter"));

router.get("/authenticate", passport.authenticate("twitter", {
	failureRedirect: "/"
}), (req, res) => {
	console.log("USER ", req.user);
	res.redirect("/");
});

module.exports = router;
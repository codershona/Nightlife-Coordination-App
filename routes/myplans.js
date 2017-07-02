var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Rest = require("../models/rest");

// returns the number of places current user is going
router.get("/", (req, res) => {

	if (!req.user) {
		res.redirect("/");
	}
	else {
		let restaurantsData = [];
		User.getUserByUsername(req.user.username, (err, user) => {
			if (err) throw err;
			
			let restCount = 0;
			if (user != null) {
				restCount = user.going.length;
			}
			res.render("myplans", {
				restCount: restCount
			});
		});	
	}
	
});

module.exports = router;
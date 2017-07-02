var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Rest = require("../models/rest");

// returns the data of the restaurant specified by the index of current user's going array
router.use("/index", (req, res) => {
	let index = parseInt(req.url.substring(1, req.url.length));

	// if no user is logged in, redirect to home
	if (!req.user) {
		res.json("{}");
	}
	else {
		User.getUserByUsername(req.user.username, (err, user) => {
			if (err) throw err;

			// user exists in the database
			if (user != null) {
				// given index is within bounds
				if (index < user.going.length) {
					let going = user.going[index]["res_id"];

					Rest.getRestById(going, (err, restaurant) => {
						if (err) throw err;

						console.log("rest", restaurant);
						if (restaurant != null) {
							res.json(restaurant);
						}
						else {
							res.json("{}");
						}
					});
				}
				else {
					res.json("{}");
				}
			}
			else {
				res.json("{}");
			}
		});	
	}
	
});

module.exports = router;
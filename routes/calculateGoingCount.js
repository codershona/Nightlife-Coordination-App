var express = require("express");
var router = express.Router();
var Rest = require("../models/rest");

// returns the number of people going to the restaurant with the given id
router.use("/ids", (req, res) => {
	let ids = req.url.substring(1, req.url.length);

	Rest.getRestById(ids, (err, restaurant) => {
		if (err) throw err;

		let a = "0";
		if (restaurant != null) {
			a = restaurant.goingCount.toString();
		}

		res.end(a);
	});

});

module.exports = router;
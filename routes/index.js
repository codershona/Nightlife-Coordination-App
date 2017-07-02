var express = require("express");
var router = express.Router();
var request = require("request");
var Rest = require("../models/rest");
var User = require("../models/user");

router.get("/", (req, res) => {
	res.render("index");
});

// get nearby restaurants
router.post("/", (req, res) => {

	request({
		method:"GET",
		url: "https://api.yelp.com/v3/businesses/search?limit=50&location=" + req.body.search,
		headers: {"Authorization": "Bearer v0ZVPbOiq_hpCphoAiab3wfPPIY4SAbjMgMb3W9Lu7mT4x" + 
				  "HEghxZpMvhAZOX5o876fN1BNL6y3mb2bkXtO3SM43mCsrleJC0oXi6tUM9O2Da4CD7HOwGhw" + 
				  "Ub3nBTWXYx".toString()}
	}, (error, response, body) => {
		
		body = JSON.parse(body);

		if (body.error) {
			res.render("index", {
				error_msg: "Location not found. Try specifying a more appropriate location"  
			});
		}
		else {
			
			if (req.user) {
				currentUser = req.user.username;

				res.render("index", {
					rests: body, 
					currentUser: currentUser
				});	
			}
			else {
				res.render("index", {
					rests: body
				});
			}

		}
		
	});
});

// Handle going requests
router.post("/going", (req, res) => {
	let id = req.body.id;
	let name = req.body.name;
	let url = req.body.url;
	let image_url = req.body.image;

	// Update user record
	if (!req.user) {
		res.redirect("/login");
	}
	else {
		User.update({id: req.user.id}, 
			{$push: {going: {"res_id": id, "res_name": name}}},
			(err, usr) => {
				
				if (err) throw err;
				console.log(usr);
		});

		// update restaurent record
		Rest.getRestById(id, (err, restaurant) => {
			if (err) throw err;

			// restaurant not already in db, register it
			if (restaurant == null) {
				let newRest = new Rest({
					id: id,
					name: name,
					url: url, 
					image_url: image_url,
					goingCount: 1,
					goingId: [req.user.id]
				});

				Rest.addRest(newRest, (err, rest) => {
					if (err) throw err;
					console.log(rest);
				});
			}
			// restaurant already in database
			else {
				let rid = id;
				let gc = restaurant.goingCount + 1;
				let gid = restaurant.goingId;
				gid.push(req.user.id);
				Rest.update({id: rid}, {goingCount: gc, goingId: gid}, (err, restau) => {
					if (err) throw err;
					console.log(restau);
				});
				
			}

			res.render("index", {
				success_msg: "Restaurant has been successfully added to your plans!"
			});
		});	
	}
	
});

// cancel plans for going to a restaurant
router.post("/cancelGoing", (req, res) => {
	let id = req.body.id;
	let name = req.body.name;

	if (!req.user) {
		res.redirect("/");
	}
	else {
		// In the records of current user delete the plan
		User.getUserByUsername(req.user.username, (err, user) => {
			if (err) throw err;

			if (user != null) {
				// update records in restaurants collection
				Rest.getRestById(id, (err, restaurant) => {
					if (err) throw err;

					if (restaurant != null) {
						let goingId = restaurant.goingId;
						let index = goingId.indexOf(req.user.id);

						if (index > -1) {
							goingId.splice(index, 1);
						}

						Rest.update({id: id}, 
							{goingId: goingId, $inc: {goingCount: -1}}, 
							(err,msg) => {
								
								if (err) throw err;
								console.log(msg);
						});
					}
				});

				// update records in users collection
				let going = user.going;
				let index = -1;
				for (let j in going) {
					if (going[j]["res_id"] == id) {
						index = j;
						break;
					}
				}
				if (index > -1) {
					going.splice(index, 1);
				}

				User.update({username: req.user.username}, {going: going}, (err, msg) => {
					if (err) throw err;
					console.log(msg);
				});
			}

			res.render("index", {
				success_msg: "Restaurant has been successfully removed from your plans"
			});
		});	
	}
	
});

// used to logout the currently logged in user
router.get("/logout", (req, res) => {
	if (req.user) {
		req.logout();

		req.flash("success_msg", "You have been logged out successfully!");
		res.redirect("/");
	}
	else {
		res.redirect("/");
	}
});

module.exports = router;
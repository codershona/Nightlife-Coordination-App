var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var request = require("request");

// Connect to database
mongoose.connect("mongodb://localhost/nightlife");
var db = mongoose.connection;

// Routes
var routes = require("./routes/index");               // handles / requests
var login = require("./routes/login");                // handles login
var myplans = require("./routes/myplans");            // handles myplans tab
var calculateGoingCount = require("./routes/calculateGoingCount");  // serves #people going to a bar
var restData = require("./routes/restData");          // serves data about a particular restaurant
var isUserGoing = require("./routes/isUserGoing");    // returns whether a user is going or not going

// Init App
var app = express();

// view Engine
var hbs = exphbs.create({
  defaultLayout: "layout",
  helpers: {
    stringify: (content) => {
            return JSON.stringify(content);
          }
}
});

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");


// BodyParser and CookieParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));

// Express session
app.use(session({
	secret: "secret",
	saveUninitialized: true,
	resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash for displaying messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.user = req.user || null;
	next();
});

// handling requests
app.use("/", routes);
app.use("/login", login);
app.use("/myplans", myplans);
app.use("/isUserGoing", isUserGoing);
app.use("/restData", restData);
app.use("/calculateGoingCount", calculateGoingCount);

// handle 404 request
app.use((req, res) => {
	res.render("404");
});

app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), () => {
	console.log("Server is running at port: ", app.get("port"));
});
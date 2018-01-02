var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/nytScraper");

app.get("/scrape", function(req, res) {
	axios.get("https://www.nytimes.com/section/world?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=World&WT.nav=page").then(function(response) {
		var $ = cheerio.load(response.data);

		$("headline h2").each(function(i, element) {
			var result = {};

			result.title = $(this).children("a").text();
			result.link = $(this).children("a").attr("href");
			result.summary = $(this).children("p").attr("summary").text();

			db.nytArticle
				.create(result)
				.then(function(dbnytArticle) {
					res.send("Scrape Complete");
				})
				.catch(function(err) {
					res.json(err);
				});
			});
		});
	});

	app.get("articles/:id", function(req, res) {
		db.nytArticle
		.findOne({ _id: req.params.id })
		.populate("note")
		.then(function(dbnytArticle) {
			res.json(dbnytArticle);
		})
		.catch(function(err) {
			res.json(err);
		});
	});

	app.post("/articles/:id", function(req, res) {
		db.Note
		.create(req.body)
		.then(function(dbNote) {
			return db.nytArticle.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
		})
		.then(function(dbArticle) {
			res.json(err);
		});
	});	

app.listen(PORT, function() {
	console.log("App running on port " + PORT + "!");
});	
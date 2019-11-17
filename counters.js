var myVersion = "0.5.2", myProductName = "counters";

const fs = require ("fs");
const davehttp = require ("davehttp");
const s3 = require ("daves3");
const utils = require ("daveutils");

var config = {
	port: 1962,
	flLogToConsole: true,
	s3Path: "/static.scripting.com/counters/scripting/",
	fnameToday: "today.json",
	fnameStats: "stats.json"
	};
var stats = { 
	ctHits: 0,
	ctHitsToday: 0,
	ctLaunches: 0,
	ctDayRollovers: 0,
	ctSaves: 0,
	whenLastDayRollover: new Date (),
	whenLastLaunch: new Date (),
	whenLastHit: new Date (0),
	whenLastSave: new Date (0),
	product: myProductName + " v" + myVersion, //11/17/19 by DW
	referrers: [],
	pages: []
	};
var flStatsChanged = false;

function statsChanged () {
	flStatsChanged = true;
	}
function saveStats () {
	var s3Path = config.s3Path + config.fnameToday;
	var s3ArchivePath = config.s3Path + utils.getDatePath (undefined, false) + ".json";
	stats.ctSaves++;
	stats.whenLastSave = new Date ();
	stats.product = myProductName + " v" + myVersion;
	var jsontext = utils.jsonStringify (stats);
	function save (s3Path) {
		s3.newObject (s3Path, jsontext, "application/json", "public-read", function (err, data) {
			if (err) {
				console.log ("saveStats: s3path == " + s3path + ", err.message == " + err.message);
				}
			else {
				}
			});
		}
	save (s3Path);
	save (s3ArchivePath);
	utils.sureFilePath (config.fnameStats, function () {
		fs.writeFile (config.fnameStats, jsontext, function (err) {
			});
		});
	}
function count (group, referer, url, callback) {
	var flnotfound;
	//referrers
		if (referer.length > 0) {
			flnotfound = true;
			stats.referrers.forEach (function (item) {
				if (item.url == referer) {
					item.ct++;
					flnotfound = false;
					}
				});
			if (flnotfound) {
				stats.referrers.push ({
					ct: 1,
					url: referer
					});
				}
			stats.referrers.sort (function (a, b) {
				if (b.ct < a.ct) {
					return (-1);
					}
				else {
					if (a.ct < b.ct) {
						return (1)
						}
					else {
						return (0);
						}
					}
				});
			}
	//pages
		flnotfound = true;
		stats.pages.forEach (function (item) {
			if (item.url == url) {
				item.ct++;
				flnotfound = false;
				}
			});
		if (flnotfound) {
			stats.pages.push ({
				ct: 1,
				url: url
				});
			}
		stats.pages.sort (function (a, b) {
			if (b.ct < a.ct) {
				return (-1);
				}
			else {
				if (a.ct < b.ct) {
					return (1)
					}
				else {
					return (0);
					}
				}
			});
	statsChanged ();
	callback (undefined, "We got your ping on " + new Date ().toLocaleString ());
	}
function readStats (callback) {
	utils.sureFilePath (config.fnameStats, function () {
		fs.readFile (config.fnameStats, function (err, data) {
			if (!err) {
				try {
					var jstruct = JSON.parse (data.toString ());
					for (var x in jstruct) {
						stats [x] = jstruct [x];
						}
					}
				catch (err) {
					}
				}
			if (callback !== undefined) {
				callback ();
				}
			});
		});
	}
function everyMinute () {
	var now = new Date ();
	if (!utils.sameDay (stats.whenLastDayRollover, now)) { //date rollover
		console.log ("everyMinute: day rollover.");
		stats.ctDayRollovers++;
		stats.whenLastDayRollover = now;
		stats.ctHitsToday = 0;
		stats.referrers = new Array ();
		stats.pages = new Array ();
		statsChanged ();
		}
	}
function everySecond () {
	if (flStatsChanged) {
		flStatsChanged = false;
		saveStats ();
		}
	}

console.log ("\n" + myProductName + " v" + myVersion);
if (process.env.PORT !== undefined) {
	config.port = process.env.PORT;
	}
readStats (function () {
	stats.ctLaunches++;
	stats.whenLastLaunch = new Date ();
	statsChanged ();
	davehttp.start (config, function (theRequest) {
		var params = theRequest.params;
		stats.ctHits++;
		stats.ctHitsToday++;
		stats.whenLastHit = new Date ();
		statsChanged ();
		function returnPlainText (s) {
			theRequest.httpReturn (200, "text/plain", s.toString ());
			}
		function returnData (jstruct) {
			if (jstruct === undefined) {
				jstruct = {};
				}
			theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
			}
		function returnError (jstruct) {
			theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
			}
		function httpReturn (err, jstruct) {
			if (err) {
				returnError (err);
				}
			else {
				returnData (jstruct);
				}
			}
		switch (theRequest.lowerpath) {
			case "/version":
				returnPlainText (myVersion);
				return;
			case "/now":
				returnPlainText (new Date ());
				return;
			case "/counter":
				count (params.group, params.referer, params.url, httpReturn);
				return;
			}
		theRequest.httpReturn (404, "text/plain", "Not found.");
		});
	setInterval (everySecond, 1000); 
	utils.runEveryMinute (everyMinute);
	});

const blockedDomains = ["w6az.com", "oldschool.scripting.com"]; //11/27/20 by DW

var countersdata;

var maxUrlLenForDisplay = 60;

var myGroupName = "scripting";

var whichArrayToDisplay = "Pages";

var whenLastUpdate = "", ctUpdates = 0, ctChecks = 0;


function looksLikeUrl (s) { //12/31/19 by DW
	s = s.toLowerCase ();
	if (beginsWith (s, "http://") || beginsWith (s, "https://")) {
		return (true);
		}
	return (false);
	}
function processTitleParam (url) { //1/6/20 by DW
	if (stringContains (url, "title=")) {
		var searchparams = "?" + stringNthField (url, "?", 2);
		function getparam (name) {
			return (decodeURI ((RegExp(name + '=' + '(.+?)(&|$)').exec(searchparams)||[,null])[1]));
			}
		var title = getparam ("title");
		if (title != "null") {
			return (decodeURIComponent (title));
			}
		}
	return (url);
	}
function securityCheck (url) { //2/25/20 by DW
	var params = stringNthField (url, "?", 2);
	var splits = params.split ("&");
	var flproblem = false;
	splits.forEach (function (param) {
		if (beginsWith (param, "oauth_token")) {
			flproblem = true;
			}
		if (beginsWith (param, "oauth_token_secret")) {
			flproblem = true;
			}
		});
	if (flproblem) {
		console.log (url);
		}
	return (!flproblem);
	}

function okDomain (url) { //11/27/20 by DW
	var domain = stringLower (getDomainFromUrl (url)), flblocked = false;
	blockedDomains.forEach (function (d) {
		if (stringLower (d) == domain) {
			flblocked = true;
			}
		});
	return (!flblocked);
	}

function formatDate (theDate, dateformat, timezone) {
	try {
		var offset = new Number (timezone);
		var d = new Date (theDate);
		var localTime = d.getTime ();
		var localOffset = d.getTimezoneOffset () *  60000;
		var utc = localTime + localOffset;
		var newTime = utc + (3600000 * offset);
		return (new Date (newTime).strftime (dateformat));
		}
	catch (tryerror) {
		return (new Date (theDate).strftime (dateformat));
		}
	}

function httpRequest (url, callback) {
	var timeout = 3000;
	var headers = new Object ();
	var jxhr = $.ajax ({ 
		url: url,
		dataType: "text", 
		headers,
		timeout
		}) 
	.success (function (data, status) { 
		callback (undefined, data);
		}) 
	.error (function (status) { 
		var message;
		try { //9/18/21 by DW
			message = JSON.parse (status.responseText).message;
			}
		catch (err) {
			message = status.responseText;
			}
		if ((message === undefined) || (message.length == 0)) { //7/22/22 by DW & 8/31/22 by DW
			message = "There was an error communicating with the server.";
			}
		var err = {
			code: status.status,
			message
			};
		callback (err);
		});
	}
function viewTodaysHits (groupname="scripting") {
	var url = "//s3.amazonaws.com/static.scripting.com/counters/" + groupname + "/today.json";
	httpRequest (url, function (err, jsontext) {
		if (err) {
			console.log (err.message);
			}
		else {
			var s = "";
			
			var countersdata = JSON.parse (jsontext);;
			
			if (countersdata.whenLastUpdate != whenLastUpdate) {
				var ix = whichArrayToDisplay.toLowerCase ();
				
				countersdata [ix].sort (function (a, b) {
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
				for (var i = 0; i < countersdata [ix].length; i++) {
					var x = countersdata [ix] [i], urlForDisplay = x.url;
					if (securityCheck (x.url)) {
						if (okDomain (x.url)) { //11/27/20 by DW
							if (urlForDisplay != undefined) {
								if (looksLikeUrl (x.url)) { //12/31/19 by DW
									urlForDisplay = processTitleParam (urlForDisplay); //1/6/20 by DW
									if (urlForDisplay.length > maxUrlLenForDisplay) {
										urlForDisplay = stringMid (urlForDisplay, 1, maxUrlLenForDisplay) + "...";
										}
									s += "<tr><td><a href=\"" + x.url + "\">" + urlForDisplay + "</a></td><td class=\"tdCt\">&nbsp;" + x.ct + "</td></tr>";
									}
								}
							}
						}
					}
				
				document.getElementById ("idCountsContainer").innerHTML = "<table class=\"table table-striped tableCounts\">" + s + "</table>";
				document.getElementById ("idTitle").innerHTML = whichArrayToDisplay + " list for <i>" + groupname + "</i> group";
				
				//last update display
					var d = new Date (countersdata.whenLastHit);
					document.getElementById ("idWhenLastUpdate").innerHTML = "<b>Last update</b>: " + formatDate (d, "%A, %B %e, %Y at %l:%M %p", "-5") + ".";
				
				whenLastUpdate = countersdata.whenLastUpdate;
				
				ctUpdates++;
				}
			
			document.getElementById ("idCtChecks").innerHTML = ctUpdates + " / " + ++ctChecks;
			
			}
		});
	}
function setGroup (groupname) {
	myGroupName = groupname;
	whenLastUpdate = ""; //force update
	viewTodaysHits ();
	}
function setArray (arrayname) {
	whichArrayToDisplay = arrayname;
	whenLastUpdate = ""; //force update
	viewTodaysHits ();
	}
function everyTenSeconds () {
	viewTodaysHits ();
	}
function startup () {
	var group = getURLParameter ("group"), list = getURLParameter ("list");
	if (group != "null") {
		myGroupName = group;
		}
	if (list != "null") {
		whichArrayToDisplay = list;
		}
	viewTodaysHits ();
	self.setInterval (everyTenSeconds, 10 * 1000); //call every ten seconds
	hitCounter (); 
	}

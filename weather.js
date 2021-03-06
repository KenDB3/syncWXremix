//syncWXremix by KenDB3 - http://bbs.kd3.us
//Code for Error Handling by Kirkman - http://breakintochat.com & https://github.com/Kirkman
//Code for detection of a Web Socket client's Real IP address by echicken - http://bbs.electronicchicken.com/ & https://github.com/echicken
//Original syncWX by nolageek - http://www.capitolshrill.com/ & https://gist.github.com/nolageek/4168edf17fae3f834e30
//Weather Icon designs done in Ctrl-A colored ASCII (Synchronet Formatting) by KenDB3
//Weather Icons inspired by wego (Weather Client for Terminals), created by Markus Teich <teichm@in.tum.de> - https://github.com/schachmat/wego
//See License file packaged with the icons for ISC License

log(user.ip_address);

//Load modopts.ini info early so we can detect if the section exists for [SyncWX]
var opts=load({},"modopts.js","SyncWX"); 
if (opts === null) {
	log("ERROR in weather.js: opts is null.");
	log("ERROR in weather.js: Are you sure you have a section in modopts.ini labeled [SyncWX]? See sysop.txt for instructions.");
	exit();
}

load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); //loads a bunch-o-stuff that is probably beyond the understanding of mere mortals 
load(js.exec_dir + 'websocket-helpers.js');

//Try to load new wxlanguage.js file, but default to English if it is missing
try {
	load(js.exec_dir + 'wxlanguage.js');
} catch (err) {
	log("ERROR in weather.js. " + err);
	log("ERROR in weather.js. Language will default to English. For alternate language support, get wxlanguage.js at https://raw.githubusercontent.com/KenDB3/syncWXremix/master/wxlanguage.js");
} finally {
	WXlang = "";
	LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	ReadAlert = "Read the Full Alert";
	degreeSymbol = "\370"; //ANSI/CP437 Degree Symbol
}

var wungrndAPIkey = opts.wungrndAPIkey; // Your wunderground API key is now defined in the file /sbbs/ctrl/modopts.ini - see the sysop.txt instructions.
//Get a wunderground API key here: http://api.wunderground.com/weather/api/
//Note: I originally signed up for Stratus Plan because I thought that was the only free one, turns out all three are free, 
//it just costs money for more than 500 hits per day. Sign up for at least Cumulus Plan to make sure you are getting the 
//Severe Alerts (which I am somehow still getting with the lower Stratus Plan). 

var weathericon_ext = opts.weathericon_ext; // Now defined in the file /sbbs/ctrl/modopts.ini - see the sysop.txt instructions.
var fallback_type = opts.fallback_type; 
var fallback = opts.fallback; 
var dialup = (parseInt(user.connection) > 0); // Programatically detect a SEXPOTS/dial-up connection by checking if user.connection is a number (e.g. "28800") rather than a protocol string (e.g. "Telnet").

//If a user connects through HTMLterm (HTML5 fTelnet @ my.ftelnet.ca), then it goes through a proxy. 
//If that proxy is on your local machine and has a private IP, this causes issues. The same issues are seen 
//when a sysop logs in from a private IP on their local network.
//Test for common private IP schemes (or loopback or even APIPA). 
//If any of those match, then use "fallback_type" and "fallback" from /sbbs/ctrl/modopts.ini to determine how
//to fall back. Either with US Postal ZIP, ICAO or IATA Airport Code, or to the public IP of the BBS. 
//websocket-helper.js (thanks to echicken) will attempt to report the real IP of the Web user connecting with HTML5 ftelnet on a Telnet connection when using exec/websocket-telnet-service.js as a proxy. 
//If you are using the new V4 Web UI from echicken, then you will also be able to get the real IP of a user through RLogin when a user is logged into the V4 WebUI and using exec/websocket-rlogin-service.js as a proxy.

function getQuerySuffix() {
	var qs;
	var ip = resolve_ip(system.inet_addr);
	if (dialup)
        	{
        	if (fallback_type == 'nonip') {
            		qs = fallback + '.json';
        	} else {
            		qs = 'autoip.json?geo_ip=' + ip;
        	}
    } else if (user.ip_address.search(
			/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^169\.254\.)|(^::1$)|(^[fF][cCdD])/
		) > -1 || user.ip_address === ip
	) {
		if (fallback_type == 'nonip') {
			qs = fallback + '.json';
		} else {
			if (client.protocol === 'Telnet') {
				qs = wstsGetIPAddress();
			} else if (bbs.sys_status&SS_RLOGIN) {
				qs = wsrsGetIPAddress();
			}
			if (typeof qs === 'undefined') qs = ip;
			qs = 'autoip.json?geo_ip=' + qs;
		}
	} else {
		qs = 'autoip.json?geo_ip=' + user.ip_address;
	}
	return qs;
}

var wungrndQuery = getQuerySuffix();

//I'm not sure if this is entirely necessary seeing as this is for backup purposes, but I am covering my bases as best as I can
function getBackupSuffix() {
	var bs;
	var ip = resolve_ip(system.inet_addr);
	if (dialup)
    {
     	bs = ip;
    } else if (user.ip_address.search(
			/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^169\.254\.)|(^::1$)|(^[fF][cCdD])/
		) > -1 || user.ip_address === ip
	) {
		if (client.protocol === 'Telnet') {
			bs = wstsGetIPAddress();
		} else if (bbs.sys_status&SS_RLOGIN) {
			bs = wsrsGetIPAddress();
		}
		if (typeof bs === 'undefined') bs = ip;
	} else {
		bs = user.ip_address;
	}
	return bs;
}

var backupQuery = getBackupSuffix();

//Make some CP437/ANSI arrows for the wind direction (Ex: wind coming from NNE = down arrow, down arrow, left arrow)
//Think Opposite arrow than the direction, because the wind is not going in that direction, but coming from that direction.
//Concept modified from wego - https://github.com/schachmat/wego
		var windArrowDirN = "\001h\001y\031";
		var windArrowDirNNE = "\001h\001y\031\031\021";
		var windArrowDirNE = "\001h\001y\031\021";
		var windArrowDirENE = "\001h\001y\021\031\021";
		var windArrowDirE = "\001h\001y\021";
		var windArrowDirESE = "\001h\001y\021\030\021";
		var windArrowDirSE = "\001h\001y\030\021";
		var windArrowDirSSE = "\001h\001y\030\030\021";
		var windArrowDirS = "\001h\001y\030";
		var windArrowDirSSW = "\001h\001y\030\030\020";
		var windArrowDirSW = "\001h\001y\030\020";
		var windArrowDirWSW = "\001h\001y\020\030\020";
		var windArrowDirW = "\001h\001y\020";
		var windArrowDirWNW = "\001h\001y\020\031\020";
		var windArrowDirNW = "\001h\001y\031\020";
		var windArrowDirNNW = "\001h\001y\031\031\020";

function forecast() {
        var req= new HTTPRequest();
		//This query combines 4 different queries into 1 and saves you API calls that count against your free (or paid) total
		//It pulls down info for conditions, forecast, astronomy (all 3 are Stratus Plan), and alerts (Cumulus Plan). 
		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + wungrndQuery);
		// Make sure we actually got a response. If not, log an error and exit.
		if (current === undefined) {
			log("ERROR in weather.js: Request to api.wunderground.com returned 'undefined'");
			log("ERROR in weather.js: More than likely the entire request to the API failed and that could mean wunderground.com or the API itself is down.");
			exit();
		}
		// Parse the JSON response.
		var cu = JSON.parse(current);
		// Check if the JSON is properly formatted. The "response" should wrap the entire object.
		if (cu.hasOwnProperty("response") ) {
			// Check if the response contains an error message. If so, log the error and exit.
			if (cu["response"].hasOwnProperty("error")) {
				var errtype = cu["response"]["error"]["type"];
				var errdesc = cu["response"]["error"]["description"];
				//Due to a lengthy period of intermittent results for IP lookups with api.wunderground.com, I am introducing a backup GeoIP lookup.
				//The specific error that is typically associated with this, is querynotfound. If we encounter that, attempt to use http://geoip.nekudo.com/api/[ip-address] as our lookup, as this does not require one to get an API Key and is free to use.
				//Usable results from nekudo are the Latitude and Longitude coordinates, which has a good success rate with Wunderground even when the API is having a hard time with GeoIP lookups. 
				if (errtype == "querynotfound") {
					log("ERROR in weather.js: api.wunderground.com returned a '" + errtype + "' error with this description: '" + errdesc + "'.");
					log(LOG_DEBUG,"DEBUG for weather.js. API call looked like this at time of error: " + "http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + wungrndQuery);
					log(LOG_DEBUG,"DEBUG for weather.js. The user.connection object looked like this at the time of error: " + user.connection);
					log(LOG_DEBUG,"DEBUG for weather.js. The dialup variable looked like this at the time of error: " + dialup);
					log(LOG_DEBUG,"DEBUG for weather.js. The weather icon extension defined in /ctrl/modopts.ini is: " + opts.weathericon_ext);
					log(LOG_DEBUG,"DEBUG for weather.js. The fallback type defined in /ctrl/modopts.ini is: " + opts.fallback_type);
					log(LOG_DEBUG,"DEBUG for weather.js. The fallback defined in /ctrl/modopts.ini is: " + opts.fallback);
					log(LOG_DEBUG,"DEBUG for weather.js. The language defined in /ctrl/modopts.ini is: " + opts.language);
					log("INFO for weather.js. Query to api.wunderground.com returned querynotfound, so trying to detect location with backup GeoIP service http://geoip.nekudo.com/api/. No API key is required for this service.");
					var backupGeoIP = req.Get("http://geoip.nekudo.com/api/" + backupQuery);
						if (backupGeoIP === undefined) {
							log("ERROR in weather.js: Request to backup GeoIP service http://geoip.nekudo.com/api/ returned 'undefined'");
							exit();
						}
					var buGeo = JSON.parse(backupGeoIP);
						if ((buGeo["location"]["latitude"] == "37.751" && buGeo["location"]["longitude"] == "-97.822") || buGeo["city"] == "false") {
							log(LOG_DEBUG,"Nekudo results for condition 1: " + buGeo["location"]["latitude"] + " " + buGeo["location"]["longitude"] + " " + buGeo["city"]);
							log("INFO for weather.js: " + wungrndQuery + " lookup returned unknown location data, using fallback");
							var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + fallback + ".json");
							var cu = JSON.parse(current);
						} else {
							log(LOG_DEBUG,"INFO for weather.js: Used http://geoip.nekudo.com/api/" + wungrndQuery + ". Nekudo results for condition 2: " + buGeo["location"]["latitude"] + " " + buGeo["location"]["longitude"] + " " + buGeo["city"]);
							log("INFO for weather.js: http://geoip.nekudo.com/api/ was used for this lookup");
							log("INFO for weather.js: API Call to Wunderground was http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + buGeo["location"]["latitude"] + "," + buGeo["location"]["longitude"] + ".json");
							var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + buGeo["location"]["latitude"] + "," + buGeo["location"]["longitude"] + ".json");
							var cu = JSON.parse(current);
						}
				} else {
					log("ERROR in weather.js: api.wunderground.com returned a '" + errtype + "' error with this description: '" + errdesc + "'.");
					log(LOG_DEBUG,"DEBUG for weather.js. API call looked like this at time of error: " + "http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + wungrndQuery);
					log(LOG_DEBUG,"DEBUG for weather.js. The user.connection object looked like this at the time of error: " + user.connection);
					log(LOG_DEBUG,"DEBUG for weather.js. The dialup variable looked like this at the time of error: " + dialup);
					log(LOG_DEBUG,"DEBUG for weather.js. The weather icon extension defined in /ctrl/modopts.ini is: " + opts.weathericon_ext);
					log(LOG_DEBUG,"DEBUG for weather.js. The fallback type defined in /ctrl/modopts.ini is: " + opts.fallback_type);
					log(LOG_DEBUG,"DEBUG for weather.js. The fallback defined in /ctrl/modopts.ini is: " + opts.fallback);
					log(LOG_DEBUG,"DEBUG for weather.js. The language defined in /ctrl/modopts.ini is: " + opts.language);
					exit();
				}
			}
		}
		var weatherCountry = cu.current_observation.display_location.country; //Figure out country, US gets fahrenheit, everywhere else gets celsius. Also US gets severe alerts.
		var windDirection = cu.current_observation.wind_dir;
		var daynighticon = cu.current_observation.icon_url; //the icon_url has a default .gif icon that includes day vs. night
		var daynighticon2 = daynighticon.slice(0,-4); //remove .gif extension
		var daynighticon3 = daynighticon2.replace(/http:\/\/icons.wxug.com\/i\/c\/k\//i, ""); //remove url leading up to day or night icon name
		var dayicononly = cu.current_observation.icon; //use the icon line from the JSON response as a backup icon name, however this is always Day icons and never Night icons so it is not preferable, but again is just a backup.
		var gy = "\1n\001w"; //Synchronet Ctrl-A Code for Normal White (which looks gray)
		var wh = "\001w\1h"; //Synchronet Ctrl-A Code for High Intensity White
		var drkyl = "\001n\001y"; //Synchronet Ctrl-A Code for Dark (normal) Yellow
		var yl = "\001y\1h"; //Synchronet Ctrl-A Code for High Intensity Yellow
		var drkbl = "\001n\001b"; //Synchronet Ctrl-A Code for Dark (normal) Blue
		var bl = "\001b\1h"; //Synchronet Ctrl-A Code for High Intensity Blue
		var drkrd = "\001n\001r"; //Synchronet Ctrl-A Code for Dark (normal) Red
		var rd = "\001r\1h"; //Synchronet Ctrl-A Code for High Intensity Red
		var drkcy = "\001n\001c"; //Synchronet Ctrl-A Code for Dark (normal) Cyan
		var cy = "\001c\1h"; //Synchronet Ctrl-A Code for High Intensity Cyan
		console.clear();
		//In this next part, I am trying to check for the existence of the file, and if it does not exist,
		//then try one that is more likely to exist - ending with unknown.asc as the final backup.
		//The first section is for ANSI Terminal Users.
		if(console.term_supports(USER_ANSI)) {
			if (!file_exists(js.exec_dir + "icons/" + daynighticon3 + weathericon_ext)) {
				var daynighticon3 = "";
			}
			if (!file_exists(js.exec_dir + "icons/" + dayicononly + weathericon_ext)) {
				var dayicononly = "";
			}
			if (daynighticon3 != "") {
				console.printfile(js.exec_dir + "icons/" + daynighticon3 + weathericon_ext);
			} else if (dayicononly != "") {
				console.printfile(js.exec_dir + "icons/" + dayicononly + weathericon_ext);
			} else {
				console.printfile(js.exec_dir + "icons/unknown" + weathericon_ext);
			}
		//Force usage of .asc icons for NON-ANSI Terminal Users
		} else {
			if (!file_exists(js.exec_dir + "icons/" + daynighticon3 + ".asc")) {
				var daynighticon3 = "";
			}
			if (!file_exists(js.exec_dir + "icons/" + dayicononly + ".asc")) {
				var dayicononly = "";
			}
			if (daynighticon3 != "") {
				console.printfile(js.exec_dir + "icons/" + daynighticon3 + ".asc");
			} else if (dayicononly != "") {
				console.printfile(js.exec_dir + "icons/" + dayicononly + ".asc");
			} else {
				console.printfile(js.exec_dir + "icons/unknown" + ".asc");
			}
		}

		//Now that the icon is displayed, show the rest of the data
		//Make a choice about how to display the data based on if the user has ANSI capabilities
		if(console.term_supports(USER_ANSI)) {
			console.gotoxy(20,2);
			console.putmsg(wh + LocationHeader + yl + cu.current_observation.display_location.full);
			console.gotoxy(20,3);
			console.putmsg(wh + ConditionsHeader + yl + cu.current_observation.weather);
			console.gotoxy(20,4);
			//US gets Fahrenheit then Celsius, everyone else gets Celsius then Fahrenheit
			if (weatherCountry == "US") {
				console.putmsg(wh + TempHeader + yl + cu.current_observation.temp_f + degreeSymbol + " F (" + cu.current_observation.temp_c + degreeSymbol + " C)");
			} else {
				console.putmsg(wh + TempHeader + yl + cu.current_observation.temp_c + degreeSymbol + " C (" + cu.current_observation.temp_f + degreeSymbol + " F)");
			}
			console.gotoxy(20,5);
			console.putmsg(wh + SunHeader + yl + cu.moon_phase.sunrise.hour + ":" + cu.moon_phase.sunrise.minute + wh + " / " + yl + cu.moon_phase.sunset.hour + ":" + cu.moon_phase.sunset.minute);
			console.gotoxy(20,6);
			console.putmsg(wh + LunarHeader + yl + cu.moon_phase.phaseofMoon);
			console.gotoxy(20,7);
			console.putmsg(wh + WindHeader + yl + cu.current_observation.wind_string);
			if (windDirection == "N" | windDirection == "North") {
				console.putmsg(" " + windArrowDirN);
			} else if (windDirection == "NNE") {
				console.putmsg(" " + windArrowDirNNE);
			} else if (windDirection == "NE") {
				console.putmsg(" " + windArrowDirNE);
			} else if (windDirection == "ENE") {
				console.putmsg(" " + windArrowDirENE);
			} else if (windDirection == "E" | windDirection == "East") {
				console.putmsg(" " + windArrowDirE);
			} else if (windDirection == "ESE") {
				console.putmsg(" " + windArrowDirESE);
			} else if (windDirection == "SE") {
				console.putmsg(" " + windArrowDirSE);
			} else if (windDirection == "SSE") {
				console.putmsg(" " + windArrowDirSSE);
			} else if (windDirection == "S" | windDirection == "South") {
				console.putmsg(" " + windArrowDirS);
			} else if (windDirection == "SSW") {
				console.putmsg(" " + windArrowDirSSW);
			} else if (windDirection == "SW") {
				console.putmsg(" " + windArrowDirSW);
			} else if (windDirection == "WSW") {
				console.putmsg(" " + windArrowDirWSW);
			} else if (windDirection == "W" | windDirection == "West") {
				console.putmsg(" " + windArrowDirW);
			} else if (windDirection == "WNW") {
				console.putmsg(" " + windArrowDirWNW);
			} else if (windDirection == "NW") {
				console.putmsg(" " + windArrowDirNW);
			} else if (windDirection == "NNW") {
				console.putmsg(" " + windArrowDirNNW);
			} else {
				console.putmsg("");
			}
			console.gotoxy(20,8);
			console.putmsg(wh + UVHeader + yl + cu.current_observation.UV);

			//Forecast Summary
			for (i = 0; i < cu.forecast.simpleforecast.forecastday.length; i++) {
			console.gotoxy(4+i*19,11);
			console.putmsg(wh + cu.forecast.simpleforecast.forecastday[i].date.weekday);
			console.gotoxy(4+i*19,12);
			var dailyConditions = cu.forecast.simpleforecast.forecastday[i].conditions;
			var dailyConditionsLen = dailyConditions.length;
				if (dailyConditionsLen > 18) {
					var dailyConditions = dailyConditions.slice(0,18-dailyConditionsLen);
				} else {
					var dailyConditions = cu.forecast.simpleforecast.forecastday[i].conditions;
				}
			console.putmsg(yl + dailyConditions);
			console.gotoxy(4+i*19,13);
			//Try to match the length of the words "Low" and "High" so that they line up better with temps
			//"L", "Lo", and "Low" all work well. But for the highs, avoid "Hig" as an option, 
			//it should be "H", "Hi", or "High" - Note if dailyLow looks like "Low" we go with "High", otherwise we go with "Hi" - aesthetics...
			if (weatherCountry == "US") {
				var low = "Low  ";
				var dailyLowLen = 5 - cu.forecast.simpleforecast.forecastday[i].low.fahrenheit.length;
				var dailyLow = low.slice(0,-dailyLowLen);
				var high = "High ";
				var dailyHighLen = 5 - cu.forecast.simpleforecast.forecastday[i].high.fahrenheit.length;
				var dailyHigh = high.slice(0,-dailyHighLen);
				if (dailyHigh.length == 3 & dailyLow.length >= 3) {
					dailyHigh = "High";
				} else if (dailyHigh.length == 3 & dailyLow.length < 3) {
					dailyHigh = "Hi";
				}
			} else {
				var low = "Low  ";
				var dailyLowLen = 5 - cu.forecast.simpleforecast.forecastday[i].low.celsius.length;
				var dailyLow = low.slice(0,-dailyLowLen);
				var high = "High ";
				var dailyHighLen = 5 - cu.forecast.simpleforecast.forecastday[i].high.celsius.length;
				var dailyHigh = high.slice(0,-dailyHighLen);
				if (dailyHigh.length == 3 & dailyLow.length >= 3) {
					dailyHigh = "High";
				} else if (dailyHigh.length == 3 & dailyLow.length < 3) {
					dailyHigh = "Hi";
				}
			}
			console.putmsg(bl + dailyLow + wh + " / " + rd + dailyHigh);
			console.gotoxy(4+i*19,14);
			//US gets Fahrenheit, everyone else gets Celsius
			if (weatherCountry == "US") {
				console.putmsg(bl + cu.forecast.simpleforecast.forecastday[i].low.fahrenheit
					+ wh + " / " + rd + cu.forecast.simpleforecast.forecastday[i].high.fahrenheit + gy + " " + degreeSymbol + "F");
			} else {
				console.putmsg(bl + cu.forecast.simpleforecast.forecastday[i].low.celsius
					+ wh + " / " + rd + cu.forecast.simpleforecast.forecastday[i].high.celsius + gy + " " + degreeSymbol + "C");
			}
			}
			console.gotoxy(1,21);
			//US gets Severe Weather Alerts
			//There is an option for European alerts via Meteoalarm, however I did not code for that for two reasons
			//It requires a separate attribution, and (more importantly) would require a way to figure out how to limit the query to European Countries
			if (weatherCountry == "US" && cu.alerts[0] != null) {
				console.gotoxy(20,15);
				console.putmsg("\007"); //Audible Bell (BEL) character - ASCII 7
				console.gotoxy(20,16);
				console.putmsg(drkrd + cu.alerts[0].description + ": ");
				console.gotoxy(20,17);
				console.putmsg(rd + cu.alerts[0].date)
				console.gotoxy(20,18);
				console.putmsg(rd + AlertExpires + cu.alerts[0].expires);
				console.gotoxy(20,20);
				if(console.noyes(ReadAlert) === false)
				console.putmsg(rd + cu.alerts[0].message);
			}
			console.crlf();
			console.putmsg(gy + " syncWXremix." + drkcy + "KenDB3     " + gy + "syncWX." + yl + "nolageek     " + gy + "icons." + drkcy + "KenDB3      " + gy + "data." + drkrd + "wu" + rd + "n" + drkyl + "de" + yl + "rg" + cy + "ro" + drkcy + "un" + bl + "d");
			console.crlf();
		//This is the NON-ANSI version. Text needs to start after the icon displays. 
		//Stripped out Color Codes and Extended ASCII (degrees symbol), as well as changed formatting around. Basically nothing fancy. 
		//Alerts still work for US.
		} else { 	
			write("\r\n                   " + LocationHeader + cu.current_observation.display_location.full + "\r\n");
			write("                   " + ConditionsHeader + cu.current_observation.weather + "\r\n");
			//US gets Fahrenheit then Celsius, everyone else gets Celsius then Fahrenheit
			if (weatherCountry == "US") {
				write("                   " + TempHeader + cu.current_observation.temp_f + " F (" + cu.current_observation.temp_c + " C)" + "\r\n");
			} else {
				write("                   " + TempHeader + cu.current_observation.temp_c + " C (" + cu.current_observation.temp_f + " F)" + "\r\n");
			}
			write("                   " + SunHeader + cu.moon_phase.sunrise.hour + ":" + cu.moon_phase.sunrise.minute + " / " + cu.moon_phase.sunset.hour + ":" + cu.moon_phase.sunset.minute + "\r\n");
			write("                   " + LunarHeader + cu.moon_phase.phaseofMoon + "\r\n");
			write("                   " + WindHeader + cu.current_observation.wind_string + "\r\n");
			write("                   " + UVHeader + cu.current_observation.UV + "\r\n\r\n");

			//Forecast Summary
			for (i = 0; i < cu.forecast.simpleforecast.forecastday.length; i++) {
			write("         " + cu.forecast.simpleforecast.forecastday[i].date.weekday + ": ");
			var dailyConditions = cu.forecast.simpleforecast.forecastday[i].conditions;
			var dailyConditionsLen = dailyConditions.length;
				if (dailyConditionsLen > 26) {
					var dailyConditions = dailyConditions.slice(0,26-dailyConditionsLen);
				} else {
					var dailyConditions = cu.forecast.simpleforecast.forecastday[i].conditions;
				}
			write(dailyConditions + " | ");
			//US gets Fahrenheit, everyone else gets Celsius
			if (weatherCountry == "US") {
				write("Lo " + cu.forecast.simpleforecast.forecastday[i].low.fahrenheit
					+ " / Hi " + cu.forecast.simpleforecast.forecastday[i].high.fahrenheit + " F" + "\r\n");
			} else {
				write("Lo " + cu.forecast.simpleforecast.forecastday[i].low.celsius
					+ " / Hi " + cu.forecast.simpleforecast.forecastday[i].high.celsius + " C" + "\r\n");
			}
			}
			console.crlf();

			//US gets Severe Weather Alerts
			//There is an option for European alerts via Meteoalarm, however I did not code for that for two reasons
			//It requires a separate attribution, and (more importantly) would require a way to figure out how to limit the query to European Countries
			if (weatherCountry == "US" && cu.alerts[0] != null) {
				console.beep(); //Audible Bell 
				write("                   " + cu.alerts[0].description + ": " + "\r\n");
				write("                   " + cu.alerts[0].date + "\r\n")
				write("                   " + AlertExpires + cu.alerts[0].expires + "\r\n");
				write("               ");
				if(console.noyes(ReadAlert) === false)
				console.putmsg(cu.alerts[0].message + "\r\n");
				console.crlf();
			} else {
				console.crlf();
				console.crlf();
				console.crlf();
			}
			write(" syncWXremix.KenDB3     syncWX.nolageek     icons.KenDB3      data.wunderground\r\n");
		}
}

try {

    forecast();
    console.pause();
    console.clear();
    console.aborted = false;

} catch (err) {

log("ERROR in weather.js. " + err);
log(LOG_DEBUG,"DEBUG for weather.js. API call looked like this at time of error: " + "http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + wungrndQuery);
log(LOG_DEBUG,"DEBUG for weather.js. The user.connection object looked like this at the time of error: " + user.connection);
log(LOG_DEBUG,"DEBUG for weather.js. The dialup variable looked like this at the time of error: " + dialup);
log(LOG_DEBUG,"DEBUG for weather.js. The weather icon extension defined in /ctrl/modopts.ini is: " + opts.weathericon_ext);
log(LOG_DEBUG,"DEBUG for weather.js. The fallback type defined in /ctrl/modopts.ini is: " + opts.fallback_type);
log(LOG_DEBUG,"DEBUG for weather.js. The fallback defined in /ctrl/modopts.ini is: " + opts.fallback);
log(LOG_DEBUG,"DEBUG for weather.js. The language defined in /ctrl/modopts.ini is: " + opts.language);

} finally {

    exit();

}

exit();

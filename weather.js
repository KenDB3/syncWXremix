//syncWXremix by KenDB3 - http://bbs.kd3.us
//Code for Error Handling by Kirkman - http://breakintochat.com & https://github.com/Kirkman
//Original syncWX by nolageek - http://www.capitolshrill.com/ & https://gist.github.com/nolageek/4168edf17fae3f834e30
//Weather Icon designs done in Ctrl-A colored ASCII (Synchronet Formatting) by KenDB3
//Weather Icons inspired by wego (Weather Client for Terminals), created by Markus Teich <teichm@in.tum.de> - https://github.com/schachmat/wego
//See License file packaged with the icons for ISC License

log(user.ip_address);

load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); //loads a bunch-o-stuff that is probably beyond the understanding of mere mortals 
load(js.exec_dir + 'websocket-helpers.js');

var opts=load({},"modopts.js","SyncWX"); 
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
//If you are using the new V4 Web UI from echicken, then websocket-helper.js (thanks to echicken) will attempt to report the real IP of the Web user connecting with HTML5 ftelnet

function getQuerySuffix() {
	var qs;
	if (dialup === 'true')
        	{
        	if (fallback_type == 'nonip') {
            		qs = fallback + '.json';
        	} else {
            		qs = 'autoip.json?geo_ip=' + resolve_ip(system.inet_addr);
        	}
    } else if (user.ip_address.search(
			/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^169\.254\.)|(^::1$)|(^[fF][cCdD])/
		) > -1
	) {
		if (fallback_type == 'nonip') {
			qs = fallback + '.json';
		} else {
			if (client.protocol === 'Telnet') {
				qs = wstsGetIPAddress();
			} else if (bbs.sys_status&SS_RLOGIN) {
				qs = wsrsGetIPAddress();
			}
			if (typeof qs === 'undefined') qs = resolve_ip(system.inet_addr);
			qs = 'autoip.json?geo_ip=' + qs;
		}
	} else {
		qs = 'autoip.json?geo_ip=' + user.ip_address;
	}
	return qs;
}

var wungrndQuery = getQuerySuffix();

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
		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/q/" + wungrndQuery);
		// Make sure we actually got a response. If not, log an error and exit.
		if (current === undefined) {
			log("ERROR in weather.js: Request to api.wunderground.com returned 'undefined'");
			console.center("There was a problem getting data from Weather Underground.");
			console.center("The sysop has been notified.");
			console.pause();
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
				log("ERROR in weather.js: api.wunderground.com returned a '" + errtype + "' error with this description: '" + errdesc + "'.");
				log(LOG_DEBUG,"DEBUG for weather.js. API call looked like this at time of error: " + "http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/q/" + wungrndQuery);
				console.center("There was a problem getting data from Weather Underground.");
				console.center("The sysop has been notified.");
				console.pause();
				exit();
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
		//Now that the icon is displayed, show the rest of the data
		console.gotoxy(20,2);
		console.putmsg(wh + "Your Location: " + yl + cu.current_observation.display_location.full);
		console.gotoxy(20,3);
		console.putmsg(wh + "Current Conditions: " + yl + cu.current_observation.weather);
		console.gotoxy(20,4);
		//US gets Fahrenheit then Celsius, everyone else gets Celsius then Fahrenheit
		if (weatherCountry == "US") {
			console.putmsg(wh + "Temp: " + yl + cu.current_observation.temp_f + "\370 F (" + cu.current_observation.temp_c + "\370 C)");
		} else {
			console.putmsg(wh + "Temp: " + yl + cu.current_observation.temp_c + "\370 C (" + cu.current_observation.temp_f + "\370 F)");
		}
		console.gotoxy(20,5);
		console.putmsg(wh + "Sunrise/Sunset: " + yl + cu.moon_phase.sunrise.hour + ":" + cu.moon_phase.sunrise.minute + wh + " / " + yl + cu.moon_phase.sunset.hour + ":" + cu.moon_phase.sunset.minute);
		console.gotoxy(20,6);
		console.putmsg(wh + "Lunar Phase: " + yl + cu.moon_phase.phaseofMoon);
		console.gotoxy(20,7);
		console.putmsg(wh + "Wind: " + yl + cu.current_observation.wind_string);
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
		console.putmsg(wh + "UV Index: " + yl + cu.current_observation.UV);

//		Forecast Summary
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
				+ wh + " / " + rd + cu.forecast.simpleforecast.forecastday[i].high.fahrenheit + gy + " \370F");
		} else {
		console.putmsg(bl + cu.forecast.simpleforecast.forecastday[i].low.celsius
				+ wh + " / " + rd + cu.forecast.simpleforecast.forecastday[i].high.celsius + gy + " \370C");
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
		console.putmsg(rd + "Expires " + cu.alerts[0].expires);
		console.gotoxy(20,20);
		if(console.yesno("Read the full alert"))
		console.putmsg(rd + cu.alerts[0].message);
		}
		console.crlf();
     		console.putmsg(gy + " syncWXremix." + drkcy + "KenDB3     " + gy + "syncWX." + yl + "nolageek     " + gy + "icons." + drkcy + "KenDB3      " + gy + "data." + drkrd + "wu" + rd + "n" + drkyl + "de" + yl + "rg" + cy + "ro" + drkcy + "un" + bl + "d");
		console.crlf();
    }

forecast();
console.pause();
console.clear();
console.aborted = false;
exit();

//syncWXremix by KenDB3 - http://bbs.kd3.us
//Original syncWX by nolageek - http://www.capitolshrill.com/ & https://gist.github.com/nolageek/4168edf17fae3f834e30
//Weather Icon designs done in Ctrl-A colored ASCII (Synchronet Formatting) by KenDB3
//Weather Icons inspired by wego (Weather Client for Terminals), created by Markus Teich <teichm@in.tum.de> - https://github.com/schachmat/wego
//See License file packaged with the icons for ISC License

load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); //loads a bunch-o-stuff that is probably beyond the understanding of mere mortals 
var wungrndAPIkey = "xxxxx"; // put your wunderground API key here. 
//Get one here: http://api.wunderground.com/weather/api/
//Note: I originally signed up for Stratus Plan because I thought that was the only free one, turns out all three are free, 
//it just costs money for more than 500 hits per day. Sign up for at least Cumulus Plan to make sure you are getting the 
//Severe Alerts (which I am somehow still getting with the lower Stratus Plan). 

//Please choose your file extension for the weather icons (Ex: .asc, .ans, .mon, .rip)
//Default is ".asc", make sure you include the quotes. 
var weathericon_ext = ".asc"

//If a user connects through HTMLterm (HTML5 fTelnet @ my.ftelnet.ca), then it goes through a proxy. 
//If that proxy is on your local machine and has a private IP, this causes issues.
//Set the Private IP to whatever your SBBS machine is using, and the public IP to any 
//public IP you want. I set mine to my BBS's public static IP ... and then set it to 8.8.8.8 for GitHub as an example
if (user.ip_address != "192.168.1.100") {
	var weather_ip_address = user.ip_address;
} else {
	var weather_ip_address = "8.8.8.8";
}

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
		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/q/autoip.json?geo_ip=" + weather_ip_address);
		var cu = JSON.parse(current);
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
		console.gotoxy(20,19);
		console.putmsg(rd + "\001iPress any key to read the full alert\001n");
		console.gotoxy(1,22);
		console.crlf();
		console.pause();
		console.clear();
		console.putmsg(rd + cu.alerts[0].message);
		}
		console.crlf();
     		console.putmsg(gy + " syncWXremix." + drkcy + "KenDB3     " + gy + "syncWX." + yl + "nolageek     " + gy + "icons." + drkcy + "KenDB3      " + gy + "data." + drkrd + "wu" + rd + "n" + drkyl + "de" + yl + "rg" + cy + "ro" + drkcy + "un" + bl + "d");
		console.crlf();
    }

forecast();
console.pause();
var weather_ip_address = null;
console.clear();

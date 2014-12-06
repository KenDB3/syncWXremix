load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); // i  always load this when making stuff for synchronet don't know why

var apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // put your wunderground API key here

function Weather() {
    this.request = new HTTPRequest();
    this.RequestURL = new URL("http://api.wunderground.com/");
    this.current = function() { 
        var currentEndpoint = this.RequestURL.url +
            "api/" + apiKey + "/conditions/q/autoip.json?geo_ip=" + user.ip_address;
        //          console.putmsg("\1h\1r" + currentEndpoint + "\1h\1w\r\n This is just a debug function so you can copy and paste this in your browser and see what's happening.  comment out or delete this line when you get it cause it's un-needed\r\n");
        var response = this.request.Get(currentEndpoint);
        var currentList = this.request.body;
        currentList = JSON.parse(currentList).current_observation;
        return currentList;
    }
}
var weather = new Weather(); //creates the Rail Object so you can use it.   
function showTemp() {
        var yl = "\1h\1y"
        var rd = "\1h\1r"
        var bl = "\1h\1c"
        var or = "\1n\1y"
        var gr = "\1h\1g"
        var sv = "\1n\1w"
        var gy = "\1h\1k"
        var wh = "\1h\1w"
        var tempToShow = weather.current();
        console.crlf();
        if (tempToShow.display_location.full == null) {
            bbs.menu("weather/sunny");
            console.putmsg("@UP:4@");
            console.putmsg("@RIGHT:20@" + rd +
                "Invalid location, could not find weather forecast." + sv);
            console.crlf();
            console.putmsg("@RIGHT:20@" + gy + "Weather Icons by " + rd +
                "Hellbeard");
        } else {
            bbs.menu("weather/" + tempToShow.icon);
            console.putmsg("@UP:6@");
            console.putmsg("@RIGHT:20@" + wh + "Location: " + sv + tempToShow.display_location
                .full);
            console.crlf();
            console.putmsg("@RIGHT:20@" + wh + "Current Condition: " + sv +
                tempToShow.weather);
            console.crlf();
            console.putmsg("@RIGHT:20@" + wh + "Temp: " + tempToShow.temperature_string);
            console.crlf();
            console.crlf();
            console.putmsg("@RIGHT:60@" + gy + "syncWX." + sv + "nolageek");
            console.crlf();
            console.putmsg("@RIGHT:42@" + gy + "icons." + sv + "hellbeard" + gy +
                " data." + sv + "wunderground");
            console.crlf();
            console.crlf();
        }
    }
    //console.putmsg("TEST" + JSON.stringify(weather.current()));
    //console.pause();
showTemp();�
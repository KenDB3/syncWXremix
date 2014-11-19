load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); // i  always load this when making stuff for synchronet don't know why
var apiKey = "e43f20f97afcd70195bca30baa03fba7";

function Weather() {
    this.request = new HTTPRequest();
    this.RequestURL = new URL("http://api.openweathermap.org/");
    this.current = function() {    
        var currentEndpoint = this.RequestURL.url +
            "data/2.5/weather?q=" + user.location + "&units=imperial";
        //    console.putmsg("\1h\1r" + currentEndpoint +
        //         "\1h\1w\r\n Attn nolageek, this is just a debug function so you can copy and paste this in your browser and see what's happening.  comment out or delete this line when you get it cause it's un-needed\r\n"
        //   );
        var response = this.request.Get(currentEndpoint);
        var currentList = this.request.body;
        currentList = JSON.parse(currentList);
        return currentList;
    }
}
var weather = new Weather(); //creates the Weather Object so you can use it.   
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

        bbs.menu("weather/" + tempToShow.weather[0].icon);
        console.putmsg("@UP:4@");
        console.putmsg("@RIGHT:18@" + wh + "Location: " + sv + tempToShow.name + "\r\n");
        console.crlf();
        console.putmsg("@RIGHT:18@" + wh + "Current Condition: " + sv +
            tempToShow.weather[0].main + " (" + tempToShow.weather[0].description + ")\r\n");
        console.putmsg("@RIGHT:18@" + wh + "Temp: " + sv + tempToShow.main.temp + " (" + rd + tempToShow.main.temp_max + sv + "/" + bl + tempToShow.main.temp_min + ")\r\n");
        console.crlf();
        console.putmsg("@RIGHT:18@" + gy + "Weather Icons by " + rd + "Hellbeard");
        console.crlf();
        console.crlf();
        console.crlf();
    }
    //console.putmsg("TEST" + JSON.stringify(weather.current()));
    //console.pause();
showTemp();
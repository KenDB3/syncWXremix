load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); // i  always load this when making stuff for synchronet don't know why
	var apiKey = "e43f20f97afcd70195bca30baa03fba7";
	
function Weather() {  // this function is actually creating an object, named Rail to distinguish from Bus and Escalator Objects which you may add later.   See the API manual for all the methods available.     
    this.request = new HTTPRequest(); //uses the http.js library to create an object to create methods  for retrieving data using http                                                        
    this.RequestURL = new URL("http://api.openweathermap.org/"); //creates a URL object which the HTTPRequest object will take as an argument to fetch data
    this.current = function() { // this function corresponds to ste stations function in the API docs    
        var currentEndpoint = this.RequestURL.url +
            "data/2.5/weather?q=Washington,DC";// + apiKey; //What we are doing here is taking the base URL object and appending some properties to it so the data so it gets the right page.                                                                                                   
    //    console.putmsg("\1h\1r" + currentEndpoint +
   //         "\1h\1w\r\n Attn nolageek, this is just a debug function so you can copy and paste this in your browser and see what's happening.  comment out or delete this line when you get it cause it's un-needed\r\n"
     //   );
        var response = this.request.Get(currentEndpoint); // now we are implementing our HTTPRequest.Get method via our this.request object/instance.  I'm returning it to a variable called response for good measure although it might not be needed but can't hurt.                                                 
        var currentList = this.request.body; //If you were to load the URL that prints to the console telling you the URL, this is the body just what the web server spits out, a lot of JSON data                                                                                                                       
        currentList = JSON.parse(currentList).main;// + JSON.parse(currentList).coord; //This takes the body aka "stationList" and uses the JSON.parse to create an object.  Because of the way the data is formatted, there is a singular key Stations (uppercase) in their data that has an array filled with station Objects I want to return       
        return currentList; //returns an array of stations as objects                                                                                                                                                                                                                                                   
    }
}
var weather = new Weather(); //creates the Rail Object so you can use it.   

function showTemp() { // Just cycles through the array of stations and prints their names                                                                                                                                                                                                                            
    var tempToShow = weather.current(); //calls the Rail.stations() functions and puts it in an  objects                                                                                                                                                                                                              
   for (i = 0; i < tempToShow.length; i++) {
        var obj = tempToShow[i]
        console.putmsg("TEMP: " + obj.temp +"\r\n@PAUSE@"); //uses dot syntax to return the name and puts a return after each one.  obj[Name] would also work the same way.
    }
    console.pause();
}
console.putmsg("TEST" + JSON.stringify(weather.current()));
console.pause();
showTemp();
console.pause();
## Synopsis

**syncWXremix** is a javascript weather application designed to run on a Synchronet Bulletin Board System (BBS). It is based off of syncWX which is the original weather.js file designed by nolageek from [Capitol Shrill BBS](http://www.capitolshrill.com). Weather data comes from [Weather Underground](http://wunderground.com). The icon files are designed in special coding using ASCII 1 character (Control-A) and then a letter to define a color or special property (ie. blinking text) which is similar to ANSI specifications. Reference for Synchronet Ctrl-A can be found [here](http://wiki.synchro.net/custom:ctrl-a_codes). The icon designs were inspired by a weather app called [wego](https://github.com/schachmat/wego), which was designed by Markus Teich. Markus was contacted, and his contribution/inspiration is mentioned in the (ISC) license in the "icons" folder. 

## Code Example

The majority of what is happening in this app is based off of one query. Note, it combines four queries into one: conditions, forecast, astronomy, and alerts.

		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/q/autoip.json?geo_ip=" + weather_ip_address);
		var cu = JSON.parse(current);

## Installation

Check out sysop.txt for full installation instructions.

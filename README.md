## Synopsis

**syncWXremix** is a javascript weather application designed to run on a Synchronet Bulletin Board System (BBS). It is based off of syncWX which is the original [weather.js](https://gist.github.com/nolageek/4168edf17fae3f834e30) file designed by nolageek from [Capitol Shrill BBS](http://www.capitolshrill.com). Weather data comes from [Weather Underground](http://wunderground.com). The icon files are designed in special coding using ASCII 1 character (Control-A) and then a letter to define a color or special property (ie. blinking text) which is similar to ANSI specifications. Reference for Synchronet Ctrl-A can be found [here](http://wiki.synchro.net/custom:ctrl-a_codes). The icon designs were inspired by a weather app called [wego](https://github.com/schachmat/wego), which was designed by Markus Teich. Markus was contacted, and his contribution/inspiration is mentioned in the (ISC) license in the "icons" folder. 

## Screenshots 

Regular View:
![Regular View](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-01.png)

With weather alert:
![Weather Alert 01](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-alerts-01.png)
![Weather Alert 02](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-alerts-02.png)

Non-US location (aka, app using Celsius instead of Fahrenheit)
![Non-US Locale](http://bbs.kd3.us/screenshots/syncWX-screenshot-NL-01.png)

Links to more screenshots:
[Full Color and Monochrome versions of the ASCII Icon Set](http://bbs.kd3.us/screenshots/syncWX-icon-set.png)

## Code Example

The majority of what is happening in this app is based off of one query. Note, it combines four queries into one: conditions, forecast, astronomy, and alerts.

		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/q/autoip.json?geo_ip=" + weather_ip_address);
		var cu = JSON.parse(current);

## Installation

Check out sysop.txt for full installation instructions.

## License

This project is under ISC License, and so is the artwork in the "icons" folder. 
Please see the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/LICENSE) file for the project, and the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/icons/LICENSE) file for the icons.

## Revision History (change log)

1.00 (2015-12-21)
  *First full release, Merry Christmas!

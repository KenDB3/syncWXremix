## Synopsis

**syncWXremix** is a javascript weather application designed to run on a Synchronet Bulletin Board System (BBS). It is based off of syncWX which is the original [weather.js](https://gist.github.com/nolageek/4168edf17fae3f834e30) file designed by nolageek from [Capitol Shrill BBS](http://www.capitolshrill.com). Weather data comes from [Weather Underground](http://wunderground.com). The icon files are designed in special coding using ASCII 1 character (Control-A) and then a letter to define a color or special property (ie. blinking text) which is similar to ANSI specifications. Reference for Synchronet Ctrl-A can be found [here](http://wiki.synchro.net/custom:ctrl-a_codes). The icon designs were inspired by a weather app called [wego](https://github.com/schachmat/wego), which was designed by Markus Teich. Markus was contacted, and his contribution/inspiration is mentioned in the (ISC) license in the "icons" folder. 

## Screenshots 

Regular View:  
![Regular View](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-01.png)

With weather alert:  
![Weather Alert 01](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-Alert-New-01.png)
![Weather Alert 02](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-Alert-New-02.png)
![Weather Alert 02](http://bbs.kd3.us/screenshots/syncWX-screenshot-RI-Alert-New-03.png)

Non-US location (aka, app using Celsius instead of Fahrenheit):  
![Non-US Locale](http://bbs.kd3.us/screenshots/syncWX-screenshot-IT-Rome-Airport-01.png)

Display Option for TTY (Mono) ASCII Only looks like this with an Alert:  
![TTY Mono ASCII 01](http://bbs.kd3.us/screenshots/TTY-Mono-ASCII-Only.png)

Links to more screenshots:  
[Full Color and Monochrome versions of the ASCII Icon Set](http://bbs.kd3.us/screenshots/syncWX-icon-set.png)

## Code Example

The majority of what is happening in this app is based off of one query. Note, it combines four queries into one: conditions, forecast, astronomy, and alerts. It also adds through the "WXlang" variable the possibility for results in over 80 languages.

		var req= new HTTPRequest();
		var current = req.Get("http://api.wunderground.com/api/" + wungrndAPIkey + "/conditions/forecast/astronomy/alerts/" + WXlang + "q/" + wungrndQuery);
		var cu = JSON.parse(current);

## Installation

Check out [sysop.txt](https://github.com/KenDB3/syncWXremix/blob/master/sysop.txt) for full installation instructions.

## License

This project is under ISC License, and so is the artwork in the "icons" folder. 
Please see the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/LICENSE) file for the project, and the [LICENSE](https://github.com/KenDB3/syncWXremix/blob/master/icons/LICENSE) file for the icons.

## Revision History (change log)

Currently working on...
* Internationalization (i18n) support.
* UTF-8/Unicode Symbols to go with i18n, like degrees, maybe the wind direction arrows (not sure on the arrows).

1.04 (2016-02-10)
* Minor change: Severe Weather Alerts are now a No/Yes prompt instead of Yes/No. This will speed up Logon Events for users that hit the enter key quickly to get to the main menu.
* Retooled some spacing/positioning for the Non-ANSI TTY Mono ASCII version.

1.03 (2016-01-25)
* Just some bug fixes...
* Tweak getQuerySuffix to also check if the web socket proxy is reported as the public IP of the BBS. This now works with the new websocket-telnet-service.js, websocket-rlogin-service.js, and websocket-proxy.js.
* Fix user.number bug in websocket-helpers.js that was popping up in the Web Socket RLogin section. 

1.02 (2016-01-09)
* Functions for retrieving a WebSocket client's real IP address.
* Better checking for private/local network users.
* Add support for checking for dialup users.
* Clear abort flag before terminating. Stops behavior seen by Nightfox where quitting from a pause prompt won't show any of the items when you are back at external programs menu. (Fixed in sbbs builds starting 2016-01-03, but also grab latest /ssbs/exec/xtrn_sec.js). 
* Add display option for non-ANSI Terminals. The text was originally there, but came out unformatted. Now it looks much prettier.

1.01b (2015-12-31)
* Lots of updates based on feedback.
* Stopped supporting bbs.menu option, I don't think anyone was going to use it.
* All sysop defined variables, like the Wunderground API Key, have been moved to /sbbs/ctrl/modopts.ini.
* Automatically test for all IPv4 private and non-routable IPs, and allow Sysop to define how to fall back (with BBS IP, US Postal ZIP, or Airport Code).
* Made weather alerts into Yes/No option.
* Code added for error handling (thanks Kirkman!). Now errors are handled more gracefully, and useful error messages will Log on the BBS.
* Big thank you goes out to digital man, echicken, Nightfox, Kirkman, and Mojo. Happy New Year!

1.00 (2015-12-21)
* First full release, Merry Christmas!

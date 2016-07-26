Q: When running syncWXremix as a 'logon' event, the app is displaying information from a previous login? This can be reproduced by connecting from two different locations. If it is run as a door/external, it shows the correct location. 

A: It has more to do with Synchronet than the syncWXremix script. It was a bug reported to digital man that he fixed on December 16, 2015. However, the fix requires you to make or grab a new build of Synchronet, or at least a build that is after Dec 16 2015 12:13 am PST. Here is the relevant CVS info: [CVS Commit for the fix](http://cvs.synchro.net/commitlog.ssjs#32554)

-------------------------------------------------------

Q: What is fallback_type and fallback for?

A: This script will give the weather to your caller based on their IP address they are connecting from. If, for some reason, it cannot determine an IP address, or it finds a local IP address, it will fall back to something you define, like using the IP of the local BBS. However, you can change this functionality by changing fallback_type from bbsip to nonip. You must then choose what to put in fallback. Options include:

US Postal ZIP Code  
    Example: 02903  

ICAO Airport Code  
    Example: KPVD  

IATA Airport Code  
    Example: PVD  

Latitude, Longitude Coordinates  
    Example 1: 41.8169872,-71.4561999  
    Example 2: 37.776289,-122.395234  
    Example 3: -31.9546855,115.8350291  
    Note: There is no space in the above examples.  

State and City (for USA) or Country and City (for Non-USA) in a format that looks like one of these:  
    RI/Providence  
    CA/San_Francisco  
    France/Paris  

-------------------------------------------------------

Q: I am having a problem, how do I get more info about the error?

A: In Synchronet, change your LogLevel to be Debugging. This should generate a Debug message in your Synchronet Control Panel and Logs that has the actual String sent to wunderground.com and the error the API kicked back (hopefully).

Changing the LogLevel is done in /sbbs/ctrl/sbbs.ini  
More info about it is listed here:  
http://wiki.synchro.net/config:sbbs.ini#loglevel  

-------------------------------------------------------

Q: Users of the HTML5 version of ftelnet see the fallback information. Is there any way to show the caller info based on the IP they are connecting from?

A: Yes, there is. But, only if you run your own proxy service for ftelnet to connect through, and only if you are using [websocket-telnet-service.js](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/exec/websocket-telnet-service.js?view=log) and [websocket-rlogin-service.js](http://cvs.synchro.net/cgi-bin/viewcvs.cgi/exec/websocket-rlogin-service.js?view=log). 

websocket-telnet-service.js can be used on any of the web interfaces for Synchronet along with the code generated from [ftelnet](http://embed.ftelnet.ca/wizard/). 

websocket-rlogin-service.js would only be useful if you are running [the new bootstrap based web interface from echicken](https://github.com/echicken/synchronet-web-v4).

In your /sbbs/ctrl/ directory, open up services.ini. You should have sections that look like this:


    ; WebSocket Telnet Policy for embed.ftelnet.ca
    [WebSocket]
    Port=1123
    MaxClients=24
    Options=NO_HOST_LOOKUP
    Command=websocket-telnet-service.js
    
    ; WebSocket RLogin Policy for Synchronet Web V4
    [WebSocketRLogin]
    Port=1513
    Options=NO_HOST_LOOKUP
    Command=websocket-rlogin-service.js


//Language Support for syncWXremix
//Currently defined options: en = English, sp =  Spanish, it = Italian
//For WUnderground API info, check here: http://www.wunderground.com/weather/api/d/docs?d=language-support

//Look at /ctrl/modopts.ini to check for "language"
//Example: "language = en"
var opts=load({},"modopts.js","SyncWX"); 

if (opts.language === undefined) { //Default to English if this field is left blank or does not exist in modopts.ini
	WXlang = "lang:EN/";
	LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	ReadAlert = "Read the Full Alert";
} else if (opts.language.toLowerCase() == "en") { //English
	WXlang = "lang:EN/";
	LocationHeader = "Your Location: ";
	ConditionsHeader = "Current Conditions: ";
	TempHeader = "Temp: ";
	SunHeader = "Sunrise/Sunset: ";
	LunarHeader = "Lunar Phase: ";
	WindHeader = "Wind: ";
	UVHeader = "UV Index: ";
	AlertExpires = "Expires ";
	ReadAlert = "Read the Full Alert";
} else if (opts.language.toLowerCase() == "sp") { //Español
	WXlang = "lang:SP/";
	LocationHeader = "Lugar: ";
	ConditionsHeader = "Condiciones Actuales: ";
	TempHeader = "Temperatura: ";
	SunHeader = "Amanecer/Puesta del Sol: ";
	LunarHeader = "Fase Lunar: ";
	WindHeader = "Viento: ";
	UVHeader = "Ultravioleta: ";
	AlertExpires = "Expira ";
	ReadAlert = "Leer l'Alerta";
} else if (opts.language.toLowerCase() == "it") { //Italiano
	WXlang = "lang:IT/";
	LocationHeader = "Posto: ";
	ConditionsHeader = "Condizioni Attuali: ";
	TempHeader = "Temperatura: ";
	SunHeader = "Alba/Tramonto del Sole: ";
	LunarHeader = "Fase Lunare: ";
	WindHeader = "Vento: ";
	UVHeader = "Ultravioletto: ";
	AlertExpires = "Scade ";
	ReadAlert = "Leggere l'Avviso";
} else {						//Default to English if the option entered doesn't exist in the language file
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
}

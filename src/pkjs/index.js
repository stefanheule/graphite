function getPlatform() {
    if (Pebble.getActiveWatchInfo) {
        var watch = Pebble.getActiveWatchInfo();
        return watch.platform;
    } else {
        return 'aplite';
    }
}

function getDetails() {
    if (Pebble.getActiveWatchInfo) {
        var watch = Pebble.getActiveWatchInfo();
        return JSON.stringify(watch);
    } else {
        return '{}';
    }
}

function getWToken() {
    if (Pebble.getWatchToken) {
        return Pebble.getWatchToken();
    } else {
        return 'null';
    }
}

function getUToken() {
    if (Pebble.getAccountToken) {
        return Pebble.getAccountToken();
    } else {
        return 'null';
    }
}

// var moment = require('./moment-timezone');
// console.log("------------------------")
// console.log("------------------------")

// console.log(moment.tz.zone('America/Los_Angeles').untils)
// console.log(moment.tz.zone('America/Los_Angeles').offsets)

// console.log("------------------------")
// console.log("------------------------")

Pebble.addEventListener('ready', function () {
// -- build=debug
// --     console.log('[ info/app ] PebbleKit JS ready!');
    console.log('[ info/app ] PebbleKit JS ready!');
// -- end build
    var data = {
        "MSG_KEY_JS_READY": 1
    };
    Pebble.sendAppMessage(data);
});

Pebble.addEventListener('showConfiguration', function () {
    var url = 'https://stefanheule.com/redshift/config/10/index.html';
    url = 'https://rawgit.com/stefanheule/redshift/master/config/';

    //url = 'https://local.com/redshift/config/0/index.html';

    url += '?platform=' + encodeURIComponent(getPlatform());
    url += '&watch=' + encodeURIComponent(getDetails());
    url += '&wtoken=' + encodeURIComponent(getWToken());
    url += '&utoken=' + encodeURIComponent(getUToken());
    url += '&watch=' + encodeURIComponent(getDetails());
// -- autogen
// --     url += '&version={{ version }}';
    url += '&version=1.0';
// -- end autogen

// -- build=debug
// --     console.log('[ info/app ] Showing configuration page: ' + url);
    console.log('[ info/app ] Showing configuration page: ' + url);
// -- end build
    Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function (e) {
    var urlconfig = JSON.parse(decodeURIComponent(e.response).replace(/@/g, "%"));

    // decode config
    var config = {};
    var fullconfig = {};
// -- autogen
// -- ## for key in configuration
// --     fullconfig["{{ key["key"] }}"] = urlconfig[{{ key["id"] }}];
// -- ## if not key["local"]
// --   ## if key["type"] == "string"
// --     config["{{ key["key"] }}"] = urlconfig[{{ key["id"] }}];
// --   ## else
// --     config["{{ key["key"] }}"] = +urlconfig[{{ key["id"] }}];
// --   ## endif
// -- ## endif
// --     localStorage.setItem("{{ key["key"] }}", urlconfig[{{ key["id"] }}]);
// -- ## endfor
    fullconfig["CONFIG_VIBRATE_DISCONNECT"] = urlconfig[1];
    config["CONFIG_VIBRATE_DISCONNECT"] = +urlconfig[1];
    localStorage.setItem("CONFIG_VIBRATE_DISCONNECT", urlconfig[1]);
    fullconfig["CONFIG_VIBRATE_RECONNECT"] = urlconfig[2];
    config["CONFIG_VIBRATE_RECONNECT"] = +urlconfig[2];
    localStorage.setItem("CONFIG_VIBRATE_RECONNECT", urlconfig[2]);
    fullconfig["CONFIG_MESSAGE_DISCONNECT"] = urlconfig[3];
    config["CONFIG_MESSAGE_DISCONNECT"] = +urlconfig[3];
    localStorage.setItem("CONFIG_MESSAGE_DISCONNECT", urlconfig[3]);
    fullconfig["CONFIG_MESSAGE_RECONNECT"] = urlconfig[4];
    config["CONFIG_MESSAGE_RECONNECT"] = +urlconfig[4];
    localStorage.setItem("CONFIG_MESSAGE_RECONNECT", urlconfig[4]);
    fullconfig["CONFIG_WEATHER_UNIT_LOCAL"] = urlconfig[5];
    localStorage.setItem("CONFIG_WEATHER_UNIT_LOCAL", urlconfig[5]);
    fullconfig["CONFIG_WEATHER_RAIN_LOCAL"] = urlconfig[6];
    localStorage.setItem("CONFIG_WEATHER_RAIN_LOCAL", urlconfig[6]);
    fullconfig["CONFIG_WEATHER_SOURCE_LOCAL"] = urlconfig[7];
    localStorage.setItem("CONFIG_WEATHER_SOURCE_LOCAL", urlconfig[7]);
    fullconfig["CONFIG_WEATHER_APIKEY_LOCAL"] = urlconfig[8];
    localStorage.setItem("CONFIG_WEATHER_APIKEY_LOCAL", urlconfig[8]);
    fullconfig["CONFIG_WEATHER_LOCATION_LOCAL"] = urlconfig[9];
    localStorage.setItem("CONFIG_WEATHER_LOCATION_LOCAL", urlconfig[9]);
    fullconfig["CONFIG_WEATHER_REFRESH"] = urlconfig[10];
    config["CONFIG_WEATHER_REFRESH"] = +urlconfig[10];
    localStorage.setItem("CONFIG_WEATHER_REFRESH", urlconfig[10]);
    fullconfig["CONFIG_WEATHER_EXPIRATION"] = urlconfig[11];
    config["CONFIG_WEATHER_EXPIRATION"] = +urlconfig[11];
    localStorage.setItem("CONFIG_WEATHER_EXPIRATION", urlconfig[11]);
    fullconfig["CONFIG_WEATHER_REFRESH_FAILED"] = urlconfig[12];
    config["CONFIG_WEATHER_REFRESH_FAILED"] = +urlconfig[12];
    localStorage.setItem("CONFIG_WEATHER_REFRESH_FAILED", urlconfig[12]);
    fullconfig["CONFIG_COLOR_TOPBAR_BG"] = urlconfig[13];
    config["CONFIG_COLOR_TOPBAR_BG"] = +urlconfig[13];
    localStorage.setItem("CONFIG_COLOR_TOPBAR_BG", urlconfig[13]);
    fullconfig["CONFIG_COLOR_INFO_BELOW"] = urlconfig[14];
    config["CONFIG_COLOR_INFO_BELOW"] = +urlconfig[14];
    localStorage.setItem("CONFIG_COLOR_INFO_BELOW", urlconfig[14]);
    fullconfig["CONFIG_COLOR_PROGRESS_BAR"] = urlconfig[15];
    config["CONFIG_COLOR_PROGRESS_BAR"] = +urlconfig[15];
    localStorage.setItem("CONFIG_COLOR_PROGRESS_BAR", urlconfig[15]);
    fullconfig["CONFIG_COLOR_PROGRESS_BAR2"] = urlconfig[16];
    config["CONFIG_COLOR_PROGRESS_BAR2"] = +urlconfig[16];
    localStorage.setItem("CONFIG_COLOR_PROGRESS_BAR2", urlconfig[16]);
    fullconfig["CONFIG_COLOR_TIME"] = urlconfig[17];
    config["CONFIG_COLOR_TIME"] = +urlconfig[17];
    localStorage.setItem("CONFIG_COLOR_TIME", urlconfig[17]);
    fullconfig["CONFIG_COLOR_PERC"] = urlconfig[18];
    config["CONFIG_COLOR_PERC"] = +urlconfig[18];
    localStorage.setItem("CONFIG_COLOR_PERC", urlconfig[18]);
    fullconfig["CONFIG_COLOR_BOTTOM_COMPLICATIONS"] = urlconfig[19];
    config["CONFIG_COLOR_BOTTOM_COMPLICATIONS"] = +urlconfig[19];
    localStorage.setItem("CONFIG_COLOR_BOTTOM_COMPLICATIONS", urlconfig[19]);
    fullconfig["CONFIG_COLOR_BACKGROUND"] = urlconfig[20];
    config["CONFIG_COLOR_BACKGROUND"] = +urlconfig[20];
    localStorage.setItem("CONFIG_COLOR_BACKGROUND", urlconfig[20]);
    fullconfig["CONFIG_COLOR_TOP_COMPLICATIONS"] = urlconfig[21];
    config["CONFIG_COLOR_TOP_COMPLICATIONS"] = +urlconfig[21];
    localStorage.setItem("CONFIG_COLOR_TOP_COMPLICATIONS", urlconfig[21]);
    fullconfig["CONFIG_COLOR_DAY"] = urlconfig[22];
    config["CONFIG_COLOR_DAY"] = +urlconfig[22];
    localStorage.setItem("CONFIG_COLOR_DAY", urlconfig[22]);
    fullconfig["CONFIG_COLOR_NIGHT"] = urlconfig[23];
    config["CONFIG_COLOR_NIGHT"] = +urlconfig[23];
    localStorage.setItem("CONFIG_COLOR_NIGHT", urlconfig[23]);
    fullconfig["CONFIG_COLOR_BAT_30"] = urlconfig[24];
    config["CONFIG_COLOR_BAT_30"] = +urlconfig[24];
    localStorage.setItem("CONFIG_COLOR_BAT_30", urlconfig[24]);
    fullconfig["CONFIG_COLOR_BAT_20"] = urlconfig[25];
    config["CONFIG_COLOR_BAT_20"] = +urlconfig[25];
    localStorage.setItem("CONFIG_COLOR_BAT_20", urlconfig[25]);
    fullconfig["CONFIG_COLOR_BAT_10"] = urlconfig[26];
    config["CONFIG_COLOR_BAT_10"] = +urlconfig[26];
    localStorage.setItem("CONFIG_COLOR_BAT_10", urlconfig[26]);
    fullconfig["CONFIG_LOWBAT_COL"] = urlconfig[27];
    config["CONFIG_LOWBAT_COL"] = +urlconfig[27];
    localStorage.setItem("CONFIG_LOWBAT_COL", urlconfig[27]);
    fullconfig["CONFIG_ADVANCED_APPEARANCE_LOCAL"] = urlconfig[28];
    localStorage.setItem("CONFIG_ADVANCED_APPEARANCE_LOCAL", urlconfig[28]);
    fullconfig["CONFIG_COMPLICATION_1"] = urlconfig[29];
    config["CONFIG_COMPLICATION_1"] = +urlconfig[29];
    localStorage.setItem("CONFIG_COMPLICATION_1", urlconfig[29]);
    fullconfig["CONFIG_COMPLICATION_2"] = urlconfig[30];
    config["CONFIG_COMPLICATION_2"] = +urlconfig[30];
    localStorage.setItem("CONFIG_COMPLICATION_2", urlconfig[30]);
    fullconfig["CONFIG_COMPLICATION_3"] = urlconfig[31];
    config["CONFIG_COMPLICATION_3"] = +urlconfig[31];
    localStorage.setItem("CONFIG_COMPLICATION_3", urlconfig[31]);
    fullconfig["CONFIG_COMPLICATION_4"] = urlconfig[32];
    config["CONFIG_COMPLICATION_4"] = +urlconfig[32];
    localStorage.setItem("CONFIG_COMPLICATION_4", urlconfig[32]);
    fullconfig["CONFIG_COMPLICATION_5"] = urlconfig[33];
    config["CONFIG_COMPLICATION_5"] = +urlconfig[33];
    localStorage.setItem("CONFIG_COMPLICATION_5", urlconfig[33]);
    fullconfig["CONFIG_COMPLICATION_6"] = urlconfig[34];
    config["CONFIG_COMPLICATION_6"] = +urlconfig[34];
    localStorage.setItem("CONFIG_COMPLICATION_6", urlconfig[34]);
    fullconfig["CONFIG_PROGRESS"] = urlconfig[35];
    config["CONFIG_PROGRESS"] = +urlconfig[35];
    localStorage.setItem("CONFIG_PROGRESS", urlconfig[35]);
    fullconfig["CONFIG_TIME_FORMAT"] = urlconfig[36];
    config["CONFIG_TIME_FORMAT"] = urlconfig[36];
    localStorage.setItem("CONFIG_TIME_FORMAT", urlconfig[36]);
    fullconfig["CONFIG_INFO_BELOW"] = urlconfig[37];
    config["CONFIG_INFO_BELOW"] = urlconfig[37];
    localStorage.setItem("CONFIG_INFO_BELOW", urlconfig[37]);
    fullconfig["CONFIG_UPDATE_SECOND"] = urlconfig[38];
    config["CONFIG_UPDATE_SECOND"] = +urlconfig[38];
    localStorage.setItem("CONFIG_UPDATE_SECOND", urlconfig[38]);
    fullconfig["CONFIG_ADVANCED_FORMAT_LOCAL"] = urlconfig[39];
    localStorage.setItem("CONFIG_ADVANCED_FORMAT_LOCAL", urlconfig[39]);
    fullconfig["CONFIG_TIME_FORMAT_LOCAL"] = urlconfig[40];
    localStorage.setItem("CONFIG_TIME_FORMAT_LOCAL", urlconfig[40]);
    fullconfig["CONFIG_INFO_BELOW_LOCAL"] = urlconfig[41];
    localStorage.setItem("CONFIG_INFO_BELOW_LOCAL", urlconfig[41]);
    fullconfig["CONFIG_SHOW_DAYNIGHT"] = urlconfig[42];
    config["CONFIG_SHOW_DAYNIGHT"] = +urlconfig[42];
    localStorage.setItem("CONFIG_SHOW_DAYNIGHT", urlconfig[42]);
    fullconfig["CONFIG_STEP_GOAL"] = urlconfig[43];
    config["CONFIG_STEP_GOAL"] = +urlconfig[43];
    localStorage.setItem("CONFIG_STEP_GOAL", urlconfig[43]);
// -- end autogen

    // don't allow really small values for refresh rate
    if (config["CONFIG_WEATHER_REFRESH"] < 10) {
        config["CONFIG_WEATHER_REFRESH"] = 10;
    }
    // // set refresh to 0 to indicate that weather information is off
    // if (fullconfig["CONFIG_WEATHER_LOCAL"] == false) {
    //     config["CONFIG_WEATHER_REFRESH"] = 0;
    // }

// -- build=debug
// --     console.log('[ info/app ] Configuration page returned: ' + JSON.stringify(fullconfig));
    console.log('[ info/app ] Configuration page returned: ' + JSON.stringify(fullconfig));
// -- end build
    Pebble.sendAppMessage(config, function () {
// -- build=debug
// --         console.log('[ info/app ] Send successful: ' + JSON.stringify(config));
        console.log('[ info/app ] Send successful: ' + JSON.stringify(config));
// -- end build
    }, function(e) {
// -- build=debug
// --         console.log(JSON.stringify(config));
// --         console.log('Message failed: ' + JSON.stringify(e));
        console.log(JSON.stringify(config));
        console.log('Message failed: ' + JSON.stringify(e));
// -- end build
    });
});

/** Read a configuration element (handles defaults) */
function readConfig(key) {
    var res = localStorage.getItem(key);
    if (res === null) {
        if (false) {
            // do nothing
// -- autogen
// -- ## for key in configuration
// -- ##   if key["local"]
// --         } else if (key == "{{ key["key"] }}") {
// --             return {{ key["default"] }};
// -- ##   endif
// -- ## endfor
        } else if (key == "CONFIG_WEATHER_UNIT_LOCAL") {
            return 2;
        } else if (key == "CONFIG_WEATHER_RAIN_LOCAL") {
            return true;
        } else if (key == "CONFIG_WEATHER_SOURCE_LOCAL") {
            return 1;
        } else if (key == "CONFIG_WEATHER_APIKEY_LOCAL") {
            return "";
        } else if (key == "CONFIG_WEATHER_LOCATION_LOCAL") {
            return "";
        } else if (key == "CONFIG_ADVANCED_APPEARANCE_LOCAL") {
            return false;
        } else if (key == "CONFIG_ADVANCED_FORMAT_LOCAL") {
            return false;
        } else if (key == "CONFIG_TIME_FORMAT_LOCAL") {
            return 0;
        } else if (key == "CONFIG_INFO_BELOW_LOCAL") {
            return 0;
// -- end autogen
        }
    }
    return res;
}


var OWM_ICONS = {
    // see http://openweathermap.org/weather-conditions for details
    // day icons
    "01d": "a", // sun
    "02d": "b", // cloud and sun
    "03d": "c", // cloud
    "04d": "d", // clouds
    "09d": "e", // rain drops
    "10d": "f", // rain drops
    "11d": "g", // lightning
    "13d": "h", // snow flake
    "50d": "i", // mist
    // night icons
    "01n": "A",
    "02n": "B",
    "03n": "C",
    "04n": "D",
    "09n": "E",
    "10n": "F",
    "11n": "G",
    "13n": "H",
    "50n": "I"
};

var FORECAST_ICONS = {
    "clear-day": "a",
    "clear-night": "A",
    "rain": "f",
    "snow": "h",
    "sleet": "h",
    "wind": "j",
    "fog": "i",
    "cloudy": "d",
    "partly-cloudy-day": "b",
    "partly-cloudy-night": "B",
    "hail": "h",
    "thunderstorm": "g",
    "tornado": "j"
};

var WU_ICONS = {
    // see https://www.wunderground.com/weather/api/d/docs?d=resources/icon-sets for details
    "chanceflurries": "h",
    "chancerain": "e",
    "chancesleet": "h",
    "chancesnow": "h",
    "chancetstorms": "f",
    "clear": "a",
    "cloudy": "c",
    "flurries": "h",
    "fog": "i",
    "hazy": "i",
    "mostlycloudy": "c",
    "mostlysunny": "b",
    "partlycloudy": "d",
    "partlysunny": "b",
    "rain": "f",
    "sleet": "h",
    "snow": "h",
    "sunny": "a",
    "tstorms": "g"
};

function parseIconWU(icon) {
    return WU_ICONS[icon];
}

function parseIconOpenWeatherMap(icon) {
    return OWM_ICONS[icon];
}

function parseIconForecastIO(icon) {
    return FORECAST_ICONS[icon];
}

/** Returns true iff a and b represent the same day (ignoring time). */
function sameDate(a, b) {
    return a.getDay() == b.getDay() && a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth();
}

/** Callback if determining weather conditions failed. */
function failedWeatherCheck(err) {
// -- build=debug
// --     console.log('[ info/app ] weather request failed: ' + err);
    console.log('[ info/app ] weather request failed: ' + err);
// -- end build
    var data = {
        "MSG_KEY_WEATHER_FAILED": 1
    };
    Pebble.sendAppMessage(data);
}

function fetchWeather(latitude, longitude) {

    var now = new Date();

    var daily;
    var mode = +readConfig("CONFIG_WEATHER_MODE_LOCAL");
    mode = 3; // TODO
    if (mode == 3) {
        // use current weather information after 2pm, until 4am
        daily = !(now.getHours() >= 14 || now.getHours() <= 3);
    } else {
        daily = mode == 2; // daily mode
    }

    /** Callback on successful determination of weather conditions. */
    var success = function(low, high, cur, curicon, raindata, ts) {
        //TODO
        // if (+readConfig("CONFIG_WEATHER_UNIT_LOCAL") == 2) {
        //     temp = temp * 9.0/5.0 + 32.0;
        // }
        low = Math.round(low);
        high = Math.round(high);
        cur = Math.round(cur);
        if (!curicon) {
            curicon = "a";
        }
// -- autogen
// --         if (raindata.length > {{ perc_max_len }}) raindata = raindata.slice(0, {{ perc_max_len }});
        if (raindata.length > 30) raindata = raindata.slice(0, 30);
// -- end autogen

        var icon = curicon.charCodeAt(0);
        var data = {
            "MSG_KEY_WEATHER_ICON_CUR": icon,
            "MSG_KEY_WEATHER_TEMP_CUR": cur,
            "MSG_KEY_WEATHER_TEMP_LOW": low,
            "MSG_KEY_WEATHER_TEMP_HIGH": high
        };
        if (readConfig("CONFIG_WEATHER_RAIN_LOCAL")) {
            data["MSG_KEY_WEATHER_PERC_DATA"] = raindata;
            data["MSG_KEY_WEATHER_PERC_DATA_LEN"] = raindata.length;
            data["MSG_KEY_WEATHER_PERC_DATA_TS"] = ts;
        }
// -- build=debug
// --         console.log('[ info/app ] weather send: temp=' + low + "/" + cur + "/" + high + ", icon=" + String.fromCharCode(icon) + ".");
        console.log('[ info/app ] weather send: temp=' + low + "/" + cur + "/" + high + ", icon=" + String.fromCharCode(icon) + ".");
// -- end build
        Pebble.sendAppMessage(data);
    };

    var runRequest = function (url, parse) {
        var req = new XMLHttpRequest();
        // try for 30 seconds to get weather, then time out
        var myTimeout = setTimeout(function(){
            failedWeatherCheck("timeout");
            req.abort();
        }, 30000);
        req.open("GET", url, true);
        req.onload = function () {
            if (req.readyState === 4) {
                clearTimeout(myTimeout);
                if (req.status === 200) {
                    var response = JSON.parse(req.responseText);
                    try {
                        parse(response);
                    } catch (e) {
                        failedWeatherCheck("exception: " + e)
                    }
                } else {
                    failedWeatherCheck("non-200 status: " + req.status + " / " + req.statusText)
                }
            }
        };
// -- build=debug
// --         console.log("[ info/app ] loading from " + url);
        console.log("[ info/app ] loading from " + url);
// -- end build
        req.send(null);
    };

    var source = +readConfig("CONFIG_WEATHER_SOURCE_LOCAL");
    var apikey = readConfig("CONFIG_WEATHER_APIKEY_LOCAL");
    var load_rain = readConfig("CONFIG_WEATHER_RAIN_LOCAL");
// -- build=debug
// --     console.log('[ info/app ] requesting weather information (' + (daily ? "daily" : "currently") + ')...');
    console.log('[ info/app ] requesting weather information (' + (daily ? "daily" : "currently") + ')...');
// -- end build
    if (source == 1) {
        var query = "lat=" + latitude + "&lon=" + longitude;
        query += "&cnt=1&appid=fa5280deac4b98572739388b55cd7591";
        query = "http://api.openweathermap.org/data/2.5/weather?" + query;
        runRequest(query, function (response) {
            var temp = response.main.temp - 273.15;
            if (daily) temp = response.main.temp_max - 273.15;
            var icon = parseIconOpenWeatherMap(response.weather[0].icon);
// -- build=debug
// --             //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
            //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
// -- end build
            success(temp, icon);
        });
    } else if (source == 3) {
        var q = "conditions";
        if (daily) q = "forecast";
        var url = "http://api.wunderground.com/api/" + apikey + "/" + q + "/q/" + latitude + "," + longitude + ".json";
        runRequest(url, function (response) {
            var temp, icon;
// -- build=debug
// --             //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
            //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
// -- end build
            if (daily) {
                for (var i in response.forecast.simpleforecast.forecastday) {
                    var data = response.forecast.simpleforecast.forecastday[i];
                    var date = new Date(data.date.epoch*1000);
                    if (sameDate(now, date)) {
                        temp = +data.high.celsius;
                        icon = parseIconWU(data.icon);
                        break;
                    }
                }
            } else {
                temp = response.current_observation.temp_c;
                icon = parseIconWU(response.current_observation.icon);
            }
            success(temp, icon);
        });
    } else {
        // source == 2
        var baseurl = "https://api.darksky.net/forecast/" + apikey + "/" + latitude + "," + longitude + "?units=si&";
        var exclude = "exclude=minutely,alerts,flags";
        if (!load_rain) {
            exclude += ",hourly"
        }
        runRequest(baseurl + exclude, function(response) {
// -- build=debug
// --             //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
            //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
// -- end build
            var low = undefined, high, cur, icon;
            for (var i in response.daily.data) {
                var data = response.daily.data[i];
                var date = new Date(data.time*1000);
                if (sameDate(now, date)) {
                    low = data.temperatureMin;
                    high = data.temperatureMax;
                    //icon = data.icon;
                    break;
                }
            }
            if (low === undefined) {
                failedWeatherCheck("could not find current date");
            } else {
                cur = response.currently.temperature;
                icon = response.currently.icon;
                icon = parseIconForecastIO(icon);
                // collect perc data
                var perc_data = [];
                var ts = 0;
                if (load_rain) {
                    for (var i in response.hourly.data) {
                        var elem = response.hourly.data[i];
                        if (ts == 0) ts = elem.time;
                        if (!elem.hasOwnProperty('precipProbability')) break;
                        perc_data.push(Math.round(elem.precipProbability * 100));
                    }
                }
                success(low, high, cur, icon, perc_data, ts);
            }
        });
    }
}

Pebble.addEventListener('appmessage',
    function (e) {
// -- build=debug
// --         console.log('[ info/app ] app message received: ' + JSON.stringify(e));
        console.log('[ info/app ] app message received: ' + JSON.stringify(e));
// -- end build
        var dict = e.payload;
        if (dict["MSG_KEY_FETCH_WEATHER"]) {
            var location = readConfig("CONFIG_WEATHER_LOCATION_LOCAL");
            if (location) {
                var loc = location.split(",");
                fetchWeather(loc[0], loc[1]);
            } else {
                navigator.geolocation.getCurrentPosition(
                    function (pos) {
                        var coordinates = pos.coords;
                        fetchWeather(coordinates.latitude, coordinates.longitude);
                    },
                    function (err) {
                        failedWeatherCheck("location not found");
                    },
                    {timeout: 15000, maximumAge: 60000}
                );
            }
        }
    }
);

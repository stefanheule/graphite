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
// -- autogen
// --     var url = 'https://stefanheule.com/graphite/config/{{ config_version }}/index.html';
    var url = 'https://stefanheule.com/graphite/config/3/index.html';
// -- end autogen
    url = 'https://rawgit.com/stefanheule/graphite/master/config/';

    // url = 'https://local.com/graphite/config/0/index.html';

    url += '?platform=' + encodeURIComponent(getPlatform());
    url += '&wtoken=' + encodeURIComponent(getWToken());
    url += '&utoken=' + encodeURIComponent(getUToken());
    url += '&watch=' + encodeURIComponent(getDetails());
// -- autogen
// --     url += '&version={{ version }}';
    url += '&version=1.3';
// -- end autogen

// -- build=debug
// --     console.log('[ info/app ] Showing configuration page: ' + url);
    console.log('[ info/app ] Showing configuration page: ' + url);
// -- end build
    Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function (e) {
    var urlconfig = JSON.parse(decodeURIComponent(e.response).replace(/@/g, "%"));

// -- autogen
// -- ## for i in range(num_tzs)
// --     var previous_tz_{{ i }} = readConfig("CONFIG_TZ_{{ i }}_LOCAL");
// -- ## endfor
    var previous_tz_0 = readConfig("CONFIG_TZ_0_LOCAL");
    var previous_tz_1 = readConfig("CONFIG_TZ_1_LOCAL");
    var previous_tz_2 = readConfig("CONFIG_TZ_2_LOCAL");
// -- end autogen

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
    fullconfig["CONFIG_COLOR_WIDGET_1"] = urlconfig[19];
    config["CONFIG_COLOR_WIDGET_1"] = +urlconfig[19];
    localStorage.setItem("CONFIG_COLOR_WIDGET_1", urlconfig[19]);
    fullconfig["CONFIG_COLOR_WIDGET_2"] = urlconfig[20];
    config["CONFIG_COLOR_WIDGET_2"] = +urlconfig[20];
    localStorage.setItem("CONFIG_COLOR_WIDGET_2", urlconfig[20]);
    fullconfig["CONFIG_COLOR_WIDGET_3"] = urlconfig[21];
    config["CONFIG_COLOR_WIDGET_3"] = +urlconfig[21];
    localStorage.setItem("CONFIG_COLOR_WIDGET_3", urlconfig[21]);
    fullconfig["CONFIG_COLOR_WIDGET_4"] = urlconfig[22];
    config["CONFIG_COLOR_WIDGET_4"] = +urlconfig[22];
    localStorage.setItem("CONFIG_COLOR_WIDGET_4", urlconfig[22]);
    fullconfig["CONFIG_COLOR_WIDGET_5"] = urlconfig[23];
    config["CONFIG_COLOR_WIDGET_5"] = +urlconfig[23];
    localStorage.setItem("CONFIG_COLOR_WIDGET_5", urlconfig[23]);
    fullconfig["CONFIG_COLOR_WIDGET_6"] = urlconfig[24];
    config["CONFIG_COLOR_WIDGET_6"] = +urlconfig[24];
    localStorage.setItem("CONFIG_COLOR_WIDGET_6", urlconfig[24]);
    fullconfig["CONFIG_COLOR_BACKGROUND"] = urlconfig[25];
    config["CONFIG_COLOR_BACKGROUND"] = +urlconfig[25];
    localStorage.setItem("CONFIG_COLOR_BACKGROUND", urlconfig[25]);
    fullconfig["CONFIG_COLOR_DAY"] = urlconfig[26];
    config["CONFIG_COLOR_DAY"] = +urlconfig[26];
    localStorage.setItem("CONFIG_COLOR_DAY", urlconfig[26]);
    fullconfig["CONFIG_COLOR_NIGHT"] = urlconfig[27];
    config["CONFIG_COLOR_NIGHT"] = +urlconfig[27];
    localStorage.setItem("CONFIG_COLOR_NIGHT", urlconfig[27]);
    fullconfig["CONFIG_COLOR_BAT_30"] = urlconfig[28];
    config["CONFIG_COLOR_BAT_30"] = +urlconfig[28];
    localStorage.setItem("CONFIG_COLOR_BAT_30", urlconfig[28]);
    fullconfig["CONFIG_COLOR_BAT_20"] = urlconfig[29];
    config["CONFIG_COLOR_BAT_20"] = +urlconfig[29];
    localStorage.setItem("CONFIG_COLOR_BAT_20", urlconfig[29]);
    fullconfig["CONFIG_COLOR_BAT_10"] = urlconfig[30];
    config["CONFIG_COLOR_BAT_10"] = +urlconfig[30];
    localStorage.setItem("CONFIG_COLOR_BAT_10", urlconfig[30]);
    fullconfig["CONFIG_LOWBAT_COL"] = urlconfig[31];
    config["CONFIG_LOWBAT_COL"] = +urlconfig[31];
    localStorage.setItem("CONFIG_LOWBAT_COL", urlconfig[31]);
    fullconfig["CONFIG_ADVANCED_APPEARANCE_LOCAL"] = urlconfig[32];
    localStorage.setItem("CONFIG_ADVANCED_APPEARANCE_LOCAL", urlconfig[32]);
    fullconfig["CONFIG_WIDGET_1"] = urlconfig[33];
    config["CONFIG_WIDGET_1"] = +urlconfig[33];
    localStorage.setItem("CONFIG_WIDGET_1", urlconfig[33]);
    fullconfig["CONFIG_WIDGET_2"] = urlconfig[34];
    config["CONFIG_WIDGET_2"] = +urlconfig[34];
    localStorage.setItem("CONFIG_WIDGET_2", urlconfig[34]);
    fullconfig["CONFIG_WIDGET_3"] = urlconfig[35];
    config["CONFIG_WIDGET_3"] = +urlconfig[35];
    localStorage.setItem("CONFIG_WIDGET_3", urlconfig[35]);
    fullconfig["CONFIG_WIDGET_4"] = urlconfig[36];
    config["CONFIG_WIDGET_4"] = +urlconfig[36];
    localStorage.setItem("CONFIG_WIDGET_4", urlconfig[36]);
    fullconfig["CONFIG_WIDGET_5"] = urlconfig[37];
    config["CONFIG_WIDGET_5"] = +urlconfig[37];
    localStorage.setItem("CONFIG_WIDGET_5", urlconfig[37]);
    fullconfig["CONFIG_WIDGET_6"] = urlconfig[38];
    config["CONFIG_WIDGET_6"] = +urlconfig[38];
    localStorage.setItem("CONFIG_WIDGET_6", urlconfig[38]);
    fullconfig["CONFIG_PROGRESS"] = urlconfig[39];
    config["CONFIG_PROGRESS"] = +urlconfig[39];
    localStorage.setItem("CONFIG_PROGRESS", urlconfig[39]);
    fullconfig["CONFIG_TIME_FORMAT"] = urlconfig[40];
    config["CONFIG_TIME_FORMAT"] = urlconfig[40];
    localStorage.setItem("CONFIG_TIME_FORMAT", urlconfig[40]);
    fullconfig["CONFIG_INFO_BELOW"] = urlconfig[41];
    config["CONFIG_INFO_BELOW"] = urlconfig[41];
    localStorage.setItem("CONFIG_INFO_BELOW", urlconfig[41]);
    fullconfig["CONFIG_UPDATE_SECOND"] = urlconfig[42];
    config["CONFIG_UPDATE_SECOND"] = +urlconfig[42];
    localStorage.setItem("CONFIG_UPDATE_SECOND", urlconfig[42]);
    fullconfig["CONFIG_ADVANCED_FORMAT_LOCAL"] = urlconfig[43];
    localStorage.setItem("CONFIG_ADVANCED_FORMAT_LOCAL", urlconfig[43]);
    fullconfig["CONFIG_TIME_FORMAT_LOCAL"] = urlconfig[44];
    localStorage.setItem("CONFIG_TIME_FORMAT_LOCAL", urlconfig[44]);
    fullconfig["CONFIG_INFO_BELOW_LOCAL"] = urlconfig[45];
    localStorage.setItem("CONFIG_INFO_BELOW_LOCAL", urlconfig[45]);
    fullconfig["CONFIG_SHOW_DAYNIGHT"] = urlconfig[46];
    config["CONFIG_SHOW_DAYNIGHT"] = +urlconfig[46];
    localStorage.setItem("CONFIG_SHOW_DAYNIGHT", urlconfig[46]);
    fullconfig["CONFIG_STEP_GOAL"] = urlconfig[47];
    config["CONFIG_STEP_GOAL"] = +urlconfig[47];
    localStorage.setItem("CONFIG_STEP_GOAL", urlconfig[47]);
    fullconfig["CONFIG_TZ_0_LOCAL"] = urlconfig[48];
    localStorage.setItem("CONFIG_TZ_0_LOCAL", urlconfig[48]);
    fullconfig["CONFIG_TZ_1_LOCAL"] = urlconfig[49];
    localStorage.setItem("CONFIG_TZ_1_LOCAL", urlconfig[49]);
    fullconfig["CONFIG_TZ_2_LOCAL"] = urlconfig[50];
    localStorage.setItem("CONFIG_TZ_2_LOCAL", urlconfig[50]);
    fullconfig["CONFIG_TZ_0_FORMAT"] = urlconfig[51];
    config["CONFIG_TZ_0_FORMAT"] = urlconfig[51];
    localStorage.setItem("CONFIG_TZ_0_FORMAT", urlconfig[51]);
    fullconfig["CONFIG_TZ_1_FORMAT"] = urlconfig[52];
    config["CONFIG_TZ_1_FORMAT"] = urlconfig[52];
    localStorage.setItem("CONFIG_TZ_1_FORMAT", urlconfig[52]);
    fullconfig["CONFIG_TZ_2_FORMAT"] = urlconfig[53];
    config["CONFIG_TZ_2_FORMAT"] = urlconfig[53];
    localStorage.setItem("CONFIG_TZ_2_FORMAT", urlconfig[53]);
    fullconfig["CONFIG_HOURLY_VIBRATE"] = urlconfig[54];
    config["CONFIG_HOURLY_VIBRATE"] = +urlconfig[54];
    localStorage.setItem("CONFIG_HOURLY_VIBRATE", urlconfig[54]);
    fullconfig["CONFIG_SUNRISE_FORMAT"] = urlconfig[55];
    config["CONFIG_SUNRISE_FORMAT"] = urlconfig[55];
    localStorage.setItem("CONFIG_SUNRISE_FORMAT", urlconfig[55]);
    fullconfig["CONFIG_WIDGET_7"] = urlconfig[56];
    config["CONFIG_WIDGET_7"] = +urlconfig[56];
    localStorage.setItem("CONFIG_WIDGET_7", urlconfig[56]);
    fullconfig["CONFIG_WIDGET_8"] = urlconfig[57];
    config["CONFIG_WIDGET_8"] = +urlconfig[57];
    localStorage.setItem("CONFIG_WIDGET_8", urlconfig[57]);
    fullconfig["CONFIG_WIDGET_9"] = urlconfig[58];
    config["CONFIG_WIDGET_9"] = +urlconfig[58];
    localStorage.setItem("CONFIG_WIDGET_9", urlconfig[58]);
    fullconfig["CONFIG_WIDGET_10"] = urlconfig[59];
    config["CONFIG_WIDGET_10"] = +urlconfig[59];
    localStorage.setItem("CONFIG_WIDGET_10", urlconfig[59]);
    fullconfig["CONFIG_WIDGET_11"] = urlconfig[60];
    config["CONFIG_WIDGET_11"] = +urlconfig[60];
    localStorage.setItem("CONFIG_WIDGET_11", urlconfig[60]);
    fullconfig["CONFIG_WIDGET_12"] = urlconfig[61];
    config["CONFIG_WIDGET_12"] = +urlconfig[61];
    localStorage.setItem("CONFIG_WIDGET_12", urlconfig[61]);
// -- end autogen

    // don't allow really small values for refresh rate
    if (config["CONFIG_WEATHER_REFRESH"] < 10) {
        config["CONFIG_WEATHER_REFRESH"] = 10;
    }
    // set refresh to 0 to indicate that weather information is off
    if (!need_weather()[0]) {
        config["CONFIG_WEATHER_REFRESH"] = 0;
    }

// -- build=debug
// --     console.log('[ info/app ] Configuration page returned: ' + JSON.stringify(fullconfig));
    console.log('[ info/app ] Configuration page returned: ' + JSON.stringify(fullconfig));
// -- end build

// -- autogen
// -- ## for i in range(num_tzs)
// --     if (has_widget([{{ widgets_lookup["WIDGET_TZ_" + i|string]["id"] }}])) sendTzUpdate({{ i }});
// -- ## endfor
    if (has_widget([34])) sendTzUpdate(0);
    if (has_widget([35])) sendTzUpdate(1);
    if (has_widget([36])) sendTzUpdate(2);
// -- end autogen

    // remove config data that we don't need
// -- autogen
// -- ## for key in configuration
// -- ##   if "show_only_if" in key
// --     if (!({{ key["show_only_if"] }})) delete config["{{ key["key"] }}"];
// -- ##   endif
// -- ## endfor
    if (!(+readConfig("CONFIG_PROGRESS") != 0)) delete config["CONFIG_COLOR_PROGRESS_BAR"];
    if (!(+readConfig("CONFIG_PROGRESS") != 0)) delete config["CONFIG_COLOR_PROGRESS_BAR2"];
    if (!(readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1 && readConfig("CONFIG_SHOW_DAYNIGHT") == 1)) delete config["CONFIG_COLOR_DAY"];
    if (!(readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1 && readConfig("CONFIG_SHOW_DAYNIGHT") == 1)) delete config["CONFIG_COLOR_NIGHT"];
    if (!(readConfig("CONFIG_LOWBAT_COL") != 0)) delete config["CONFIG_COLOR_BAT_30"];
    if (!(readConfig("CONFIG_LOWBAT_COL") != 0)) delete config["CONFIG_COLOR_BAT_20"];
    if (!(readConfig("CONFIG_LOWBAT_COL") != 0)) delete config["CONFIG_COLOR_BAT_10"];
    if (!(readConfig("CONFIG_WEATHER_RAIN_LOCAL") == 1)) delete config["CONFIG_SHOW_DAYNIGHT"];
    if (!(readConfig("CONFIG_PROGRESS") == 1)) delete config["CONFIG_STEP_GOAL"];
    if (!(has_widget([34]))) delete config["CONFIG_TZ_0_LOCAL"];
    if (!(has_widget([35]))) delete config["CONFIG_TZ_1_LOCAL"];
    if (!(has_widget([36]))) delete config["CONFIG_TZ_2_LOCAL"];
    if (!(has_widget([34]))) delete config["CONFIG_TZ_0_FORMAT"];
    if (!(has_widget([35]))) delete config["CONFIG_TZ_1_FORMAT"];
    if (!(has_widget([36]))) delete config["CONFIG_TZ_2_FORMAT"];
    if (!(has_widget([37, 38, 39, 40, 41, 42]))) delete config["CONFIG_SUNRISE_FORMAT"];
// -- end autogen

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
        } else if (key == "CONFIG_TZ_0_LOCAL") {
            return "America/Los_Angeles";
        } else if (key == "CONFIG_TZ_1_LOCAL") {
            return "America/Los_Angeles";
        } else if (key == "CONFIG_TZ_2_LOCAL") {
            return "America/Los_Angeles";
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
    "03d": "d", // cloud
    "04d": "d", // clouds
    "09d": "f", // rain drops
    "10d": "f", // rain drops
    "11d": "g", // lightning
    "13d": "h", // snow flake
    "50d": "i", // mist
    // night icons
    "01n": "A",
    "02n": "B",
    "03n": "d",
    "04n": "d",
    "09n": "f",
    "10n": "f",
    "11n": "g",
    "13n": "h",
    "50n": "i"
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
    "chancerain": "f",
    "chancesleet": "h",
    "chancesnow": "h",
    "chancetstorms": "f",
    "clear": "a",
    "cloudy": "d",
    "flurries": "h",
    "fog": "i",
    "hazy": "i",
    "mostlycloudy": "d",
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

function concurrentRequests(urls, succ) {
    var i = 0;
    var n = urls.length;
    var ids = urls.map(function() { i = i+1; return i-1; });
    var done = ids.map(function() { return false });
    var doneCount = 0;
    var answers = ids.map(function() { return false });
    var reqs;
    var quit = function() {
        for (var i = 0; i < n; i++) {
            if (!done[i]) reqs[i].abort();
        }
    }
    reqs = ids.map(function(i){
        var url = urls[i];
        if (url === undefined) {
            done[i] = true;
            doneCount += 1;
            return 0;
        }
// -- build=debug
// --         console.log("[ info/app ] loading from " + url);
        console.log("[ info/app ] loading from " + url);
// -- end build
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onload = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    answers[i] = JSON.parse(req.responseText);
                    done[i] = true;
                    doneCount += 1;
                    if (doneCount == n) {
                        try {
                            succ(answers);
                        } catch (e) {
                            failedWeatherCheck("exception: " + e)
                        }
                        clearTimeout(myTimeout);
                    }
                } else {
                    quit();
                    failedWeatherCheck("non-200 status: " + req.status + " / " + req.statusText)
                }
            }
        };
        req.send(null);
        return req;
    });

    // try for 30 seconds to get weather, then time out
    var myTimeout = setTimeout(function(){
        failedWeatherCheck("timeout");
        quit();
    }, 30000);
}

function has_widget(ids) {
    for (var i = 1; i < 13; i++) {
        var id = +readConfig("CONFIG_WIDGET_" + i);
        if (ids.indexOf(id) !== -1) return true;
    }
    return false;
}

function need_weather() {
    var load_rain = +readConfig("CONFIG_WEATHER_RAIN_LOCAL");
// -- autogen
// --     var load_lowhigh = {{ config_groups_lookup["GROUP_WEATHERLOWHIGH"]["selector"] }};
// --     var load_cur = {{ config_groups_lookup["GROUP_WEATHERCUR"]["selector"] }};
// --     var load_sun = {{ config_groups_lookup["GROUP_WEATHERSUN"]["selector"] }};
    var load_lowhigh = has_widget([4, 5]);
    var load_cur = has_widget([1, 2, 3]);
    var load_sun = has_widget([37, 38, 39, 40, 41, 42]);
// -- end autogen
    return [load_rain || load_lowhigh || load_cur || load_sun, load_rain, load_lowhigh, load_cur, load_sun];
}

function fetchWeather(latitude, longitude) {

    var now = new Date();

    var nw = need_weather();
    var load_rain = nw[1];
    var load_lowhigh = nw[2];
    var load_cur = nw[3];
    var load_sun = nw[4];

    /** Callback on successful determination of weather conditions. */
    var success = function(low, high, cur, curicon, raindata, ts, sunrise, sunset) {
        if (+readConfig("CONFIG_WEATHER_UNIT_LOCAL") == 2) {
            if (low != temp_unknown) low = low * 9.0/5.0 + 32.0;
            if (high != temp_unknown) high = high * 9.0/5.0 + 32.0;
            if (cur != temp_unknown) cur = cur * 9.0/5.0 + 32.0;
        }
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
        if (load_rain) {
            data["MSG_KEY_WEATHER_PERC_DATA"] = raindata;
            data["MSG_KEY_WEATHER_PERC_DATA_LEN"] = raindata.length;
            data["MSG_KEY_WEATHER_PERC_DATA_TS"] = ts;
        }
        if (load_sun) {
            data["MSG_KEY_WEATHER_SUNRISE"] = sunrise;
            data["MSG_KEY_WEATHER_SUNSET"] = sunset;
        }
// -- build=debug
// --         console.log('[ info/app ] weather send: temp=' + low + "/" + cur + "/" + high + ", icon=" + String.fromCharCode(icon) + ", len(rain)=" + raindata.length + ", ts=" + ts + ", sunrise=" + sunrise + ".");
        console.log('[ info/app ] weather send: temp=' + low + "/" + cur + "/" + high + ", icon=" + String.fromCharCode(icon) + ", len(rain)=" + raindata.length + ", ts=" + ts + ", sunrise=" + sunrise + ".");
// -- end build
        Pebble.sendAppMessage(data);
    };

    var runRequest = function (url, parse) {
        concurrentRequests([url], function(res) { parse(res[0]); });
    };

    var temp_unknown = 32767;

    var source = +readConfig("CONFIG_WEATHER_SOURCE_LOCAL");
    var apikey = readConfig("CONFIG_WEATHER_APIKEY_LOCAL");
    var low = temp_unknown;
    var high = temp_unknown;
    var cur = temp_unknown;
    var icon = '';
    var raindata = [];
    var raints = 0;
    var sunrise = 0;
    var sunset = 0;
    if (source == 1) {
        var query = "lat=" + latitude + "&lon=" + longitude;
        query += "&cnt=1&appid=fa5280deac4b98572739388b55cd7591";
        query = "http://api.openweathermap.org/data/2.5/weather?" + query;
        runRequest(query, function (response) {
            cur = response.main.temp - 273.15;
            low = temp_unknown;
            high = temp_unknown;
            icon = parseIconOpenWeatherMap(response.weather[0].icon);
            sunrise = response.sys.sunrise;
            sunset = response.sys.sunset;
            success(low, high, cur, icon, raindata, raints, sunrise, sunset);
        });
    } else if (source == 3) {
        var url0 = !load_cur ? undefined : "http://api.wunderground.com/api/" + apikey + "/conditions/q/" + latitude + "," + longitude + ".json";
        var url1 = !load_lowhigh ? undefined : "http://api.wunderground.com/api/" + apikey + "/forecast/q/" + latitude + "," + longitude + ".json";
        var url2 = !load_rain ? undefined : "http://api.wunderground.com/api/" + apikey + "/hourly/q/" + latitude + "," + longitude + ".json";
        var url3 = !load_sun ? undefined : "http://api.wunderground.com/api/" + apikey + "/astronomy/q/" + latitude + "," + longitude + ".json";
        concurrentRequests([url0,url1,url2,url3], function (responses) {
// -- build=debug
// --             //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
            //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
// -- end build
            if (load_lowhigh) {
                for (var i in responses[1].forecast.simpleforecast.forecastday) {
                    var data = responses[1].forecast.simpleforecast.forecastday[i];
                    var date = new Date(data.date.epoch*1000);
                    if (sameDate(now, date)) {
                        high = +data.high.celsius;
                        low = +data.low.celsius;
                        break;
                    }
                }
            }
            if (load_cur) {
                cur = responses[0].current_observation.temp_c;
                icon = parseIconWU(responses[0].current_observation.icon);
            }
            if (load_rain) {
                for (var i in responses[2].hourly_forecast) {
                    var elem = responses[2].hourly_forecast[i];
                    if (raints == 0) {
                        // we don't get any data for the current hour from wunderground (why???)
                        // so we just pretend the current hour is the same as the next hour
                        raints = elem.FCTTIME.epoch - 3600;
                        raindata.push(Math.round(elem.pop));
                    }
                    raindata.push(Math.round(elem.pop));
                }
            }
            if (load_sun) {
                var d = new Date();
                var today = (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear() + " ";
                sunrise = Math.round(Date.parse(today + responses[3].sun_phase.sunrise.hour + ":" + responses[3].sun_phase.sunrise.minute) / 1000);
                sunset = Math.round(Date.parse(today + responses[3].sun_phase.sunset.hour + ":" + responses[3].sun_phase.sunset.minute)/1000);
            }
            success(low, high, cur, icon, raindata, raints, sunrise, sunset);
        });
    } else {
        // source == 2
        var baseurl = "https://api.darksky.net/forecast/" + apikey + "/" + latitude + "," + longitude + "?units=si&";
        var exclude = "exclude=minutely,alerts,flags";
        if (!load_rain) exclude += ",hourly";
        if (!load_lowhigh && !load_sun) exclude += ",daily";
        if (!load_cur) exclude += ",currently";
        runRequest(baseurl + exclude, function(response) {
// -- build=debug
// --             //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
            //console.log('[ info/app ] weather information: ' + JSON.stringify(response));
// -- end build
            if (load_lowhigh || load_sun) {
                for (var i in response.daily.data) {
                    var data = response.daily.data[i];
                    var date = new Date(data.time*1000);
                    if (sameDate(now, date)) {
                        if (load_lowhigh) {
                            low = data.temperatureMin;
                            high = data.temperatureMax;
                        }
                        if (load_sun) {
                            sunrise = data.sunriseTime;
                            sunset = data.sunsetTime;
                        }
                        break;
                    }
                }
                if (low === temp_unknown) {
                    failedWeatherCheck("could not find current date");
                    return;
                }
            }
            if (load_cur) {
                cur = response.currently.temperature;
                icon = parseIconForecastIO(response.currently.icon);
            }
            if (load_rain) {
                for (var i in response.hourly.data) {
                    var elem = response.hourly.data[i];
                    if (raints == 0) raints = elem.time;
                    if (!elem.hasOwnProperty('precipProbability')) break;
                    raindata.push(Math.round(elem.precipProbability * 100));
                }
            }
            success(low, high, cur, icon, raindata, raints, sunrise, sunset);
        });
    }
}


var moment = require('./moment-timezone');

function toTimestamp(t) {
    return Math.round(t / 1000)
}

function encode_int_to_bytes(val, nbytes) {
    var byteArray = [];
    for (var i = 0; i < nbytes; i++) byteArray.push(0);

    for (var index = 0; index < nbytes; index++) {
        var byte = val & 0xff;
        byteArray[index] = byte;
        val = (val - byte) / 256;
    }

    return byteArray;
}

function sendTzUpdate(idx) {
    var now = (new Date()).getTime();
    var zoneData = moment.tz.zone(readConfig("CONFIG_TZ_" + idx + "_LOCAL"));
    var untils = zoneData.untils;
    var found = false;
    var id = 0;
    while (id < untils.length) {
        if (now < untils[id]) {
            found = true;
            break;
        }
        id += 1
    }
    found = found && id >= 0;
    if (!found) {
        console.log('[ info/app ] error finding tz info');
        return;
    }
    var data = [];
    var i = 0;
// -- autogen
// --     var max_tzdata = {{ tz_max_datapoints }};
    var max_tzdata = 3;
// -- end autogen

// -- build=debug
// --     console.log('[ info/app ] tzdata:');
    console.log('[ info/app ] tzdata:');
// -- end build
    while (id < untils.length && i < max_tzdata) {
        var until = !isFinite(untils[id]) ? 2147483647 : toTimestamp(untils[id]);
        var offset = zoneData.offsets[id];
        Array.prototype.push.apply(data, encode_int_to_bytes(until, 4));
        Array.prototype.push.apply(data, encode_int_to_bytes(offset, 2));
        i += 1;
        id += 1;
// -- build=debug
// --         console.log('    until  = ' + until);
// --         console.log('    offset = ' + offset);
        console.log('    until  = ' + until);
        console.log('    offset = ' + offset);
// -- end build
    }

    var pebbledata = {};
    var key = "MSG_KEY_TZ_" + idx;
    pebbledata[key] = data;
    Pebble.sendAppMessage(pebbledata);
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
// -- autogen
// -- ## for i in range(num_tzs)
// --         if (dict["MSG_KEY_FETCH_TZ_{{ i }}"]) sendTzUpdate({{ i }});
// -- ## endfor
        if (dict["MSG_KEY_FETCH_TZ_0"]) sendTzUpdate(0);
        if (dict["MSG_KEY_FETCH_TZ_1"]) sendTzUpdate(1);
        if (dict["MSG_KEY_FETCH_TZ_2"]) sendTzUpdate(2);
// -- end autogen
    }
);

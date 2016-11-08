var RedshiftPreview = (function () {

    /** Map from canvasIDs to configurations. */
    var configurations = {};
    /** Map from canvasIDs to platforms. */
    var platforms = {};

    // global variables
    var ctx;
    var platform;
    var tnow = time(NULL);
    var weather;
    var buffer_1, buffer_2, buffer_3, buffer_4;
    var font_main = 'Open Sans Condensed';
    var font_weather = 'nupe2';
    var font_icon = 'FontAwesome';
    var show_bluetooth_popup = false;
    var layer_background = 0;

    function getWeather() {
        return {
            version: 0,
            timestamp: time(NULL),
            icon: "a".charCodeAt(0),
            temp_cur: 14,
            temp_low: 5,
            temp_high: 28,
            perc_data: [0.5, 0.4, 0.3, 0, 0, 0, 0, 0, 0.1, 0.12, 0.1, 0.2,0.4,0.45,0.6,1,1,0.2,0,0,0,0,0,0,0,0].map(function(x){return x*100}),
            perc_data_len: 25,
            perc_data_ts: tnow - (tnow % (60*60)),
            failed: false
        };
    }

// -- autogen
// -- ## for key in configuration
// --      var {{ key["key"] | lower }};
// -- ## endfor
     var config_vibrate_disconnect;
     var config_vibrate_reconnect;
     var config_message_disconnect;
     var config_message_reconnect;
     var config_weather_unit_local;
     var config_weather_source_local;
     var config_weather_apikey_local;
     var config_weather_location_local;
     var config_weather_refresh;
     var config_weather_expiration;
     var config_color_accent;
// -- end autogen

    // core functions and constants
    var PBL_IF_ROUND_ELSE;
    var PBL_DISPLAY_WIDTH;
    var PBL_DISPLAY_HEIGHT;

    // graphics functions and constants
    function GPoint(x, y) { return {x: x, y: y}; }
    function FPoint(x, y) { return {x: x, y: y}; }
    function FSize(w, h) { return {w: w, h: h}; }
    function GRect(x, y, w, h) { return {origin: {x: x, y: y}, size: {w: w, h: h}}; }
    function FRect(origin, size) { return {origin: origin, size: size}; }
    function g2frect(g) { return {origin: {x: INT_TO_FIXED(g.origin.x), y: INT_TO_FIXED(g.origin.y)}, size: {w: INT_TO_FIXED(g.size.w), h: INT_TO_FIXED(g.size.h)}}; }

    // fxct functions and constants
    var FIXED_POINT_SCALE = 16;
    var NULL = 0;
    function INT_TO_FIXED(x) { return x*FIXED_POINT_SCALE; }
    function REM(x) { return INT_TO_FIXED(x) * PBL_DISPLAY_WIDTH / 200; }
    function PIX(x) { return INT_TO_FIXED(x); }
    function FIXED_TO_INT(x) { return Math.floor(x/FIXED_POINT_SCALE); }
    function FIXED_ROUND(x) { return ((x) % FIXED_POINT_SCALE < FIXED_POINT_SCALE/2 ? (x) - ((x) % FIXED_POINT_SCALE) : (x) + FIXED_POINT_SCALE - ((x) % FIXED_POINT_SCALE)) }
    function fctx_init_context() {}
    function fctx_deinit_context() {}
    function layer_get_unobstructed_bounds() { return layer_get_bounds(); }
    function layer_get_bounds() { return GRect(0, 0, PBL_DISPLAY_WIDTH, PBL_DISPLAY_HEIGHT); }
    function time() { return Math.round((new Date()) / 1000); }
    function localtime() {
        return {
            tm_min: (new Date()).getMinutes(),
            tm_hour: (new Date()).getHours()
        }
    }
    function setlocale() {}
    var LC_ALL = 0;
    function COLOR(x) { return x; }
    function to_html_color(x) { return '#' + GColor.toHex(x); }
    function battery_state_service_peek() {
        return {
            charge_percent: 70,
            is_charging: false,
            is_plugged: false
        }
    }
    function sizeof() { return 0; }
    var HealthMetricStepCount = 0;
    function health_service_sum_today(what) {
        if (what == HealthMetricStepCount) return 7000;
    }
    var HealthMetricHeartRateBPM = 0;
    function health_service_peek_current_value(what) {
        if (what == HealthMetricHeartRateBPM) {
            if (platform == "basalt") return 0;
            return 65;
        }
    }
    function bluetooth_connection_service_peek() { return false; }
    var GTextAlignmentLeft = "left";
    var GTextAlignmentCenter = "center";
    var GTextAlignmentRight = "right";
    function draw_rect(fctx, rect, color) {
        ctx.fillStyle = to_html_color(color);
        ctx.fillRect(rect.origin.x/FIXED_POINT_SCALE, rect.origin.y/FIXED_POINT_SCALE, rect.size.w/FIXED_POINT_SCALE, rect.size.h/FIXED_POINT_SCALE);
    }
    function draw_circle(fctx, center, radius, color) {
        ctx.fillStyle = to_html_color(color);
        ctx.beginPath();
        ctx.arc(center.x/FIXED_POINT_SCALE, center.y/FIXED_POINT_SCALE, radius/FIXED_POINT_SCALE, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    function draw_string(fctx, str, pos, font, color, size, align) {
        var py = pos.y;
        py -= REM(1);
        if (font == font_weather) {
            py -= size * 0.3;
        }
        if (font == font_icon) {
            if (str == "1") str = "\uf004";
            py -= REM(9);
            size *= 0.8;
        }
        ctx.textAlign = align;
        ctx.textBaseline = "hanging";
        ctx.fillStyle = to_html_color(color);
        ctx.font = (size/FIXED_POINT_SCALE) + "px '" + font + "'";
        ctx.fillText(str, pos.x/FIXED_POINT_SCALE, py/FIXED_POINT_SCALE);
    }
    function string_width(fctx, str, font, size) {
        ctx.font = (size/FIXED_POINT_SCALE) + "px '" + font + "'";
        var text = ctx.measureText(str);
        return INT_TO_FIXED(text.width);
    }

    function drawConfig(canvasId) {
        var config = configurations[canvasId];
        platform = platforms[canvasId];

        var canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');

        PBL_IF_ROUND_ELSE = PebbleHelper.PBL_IF_ROUND_ELSE(platform);
        PBL_DISPLAY_WIDTH = PebbleHelper.PBL_DISPLAY_WIDTH(platform);
        PBL_DISPLAY_HEIGHT = PebbleHelper.PBL_DISPLAY_HEIGHT(platform);

        canvas.height = PBL_DISPLAY_HEIGHT;
        canvas.width = PBL_DISPLAY_WIDTH;

// -- autogen
// -- ## for key in configuration
// --         {{ key["key"] | lower }} = config["{{ key["key"] }}"];
// -- ## endfor
        config_vibrate_disconnect = config["CONFIG_VIBRATE_DISCONNECT"];
        config_vibrate_reconnect = config["CONFIG_VIBRATE_RECONNECT"];
        config_message_disconnect = config["CONFIG_MESSAGE_DISCONNECT"];
        config_message_reconnect = config["CONFIG_MESSAGE_RECONNECT"];
        config_weather_unit_local = config["CONFIG_WEATHER_UNIT_LOCAL"];
        config_weather_source_local = config["CONFIG_WEATHER_SOURCE_LOCAL"];
        config_weather_apikey_local = config["CONFIG_WEATHER_APIKEY_LOCAL"];
        config_weather_location_local = config["CONFIG_WEATHER_LOCATION_LOCAL"];
        config_weather_refresh = config["CONFIG_WEATHER_REFRESH"];
        config_weather_expiration = config["CONFIG_WEATHER_EXPIRATION"];
        config_color_accent = config["CONFIG_COLOR_ACCENT"];
// -- end autogen

        weather = getWeather(platform);

        background_update_proc(0, 0);
    }

// -- autogen
// -- c_to_js src/ui.c
/**
 * Is something obstructing our layer?
 */
function is_obstructed() {
    var layer = layer_background;
    var full = layer_get_bounds(layer);
    var partial = layer_get_unobstructed_bounds(layer);
    return full.size.h != partial.size.h || full.size.w != partial.size.w;
}
/**
 * Draws a popup about the bluetooth connection
 */
function bluetooth_popup(fctx, ctx, connected) {
    if (!show_bluetooth_popup) return;
}
/**
 * Remove all leading zeros in a string.
 */
function remove_leading_zero(buffer, length) {
    if (buffer.substring(0, 1) == "0") buffer = buffer.substring(1);
    return buffer.replace(new RegExp("([ ./])0", 'g'), "$1");
}
function draw_weather(fctx, icon, temp, position, color, fontsize, align) {
    var weather_fontsize = (fontsize * 1.15);
    var w1 = string_width(fctx, icon, font_weather, weather_fontsize);
    var w2 = string_width(fctx, temp, font_main, fontsize);
    var sep = REM(2);
    var w = w1 + w2 + sep;
    var a = GTextAlignmentLeft;
    if (align == GTextAlignmentCenter) {
        draw_string(fctx, icon, FPoint(position.x - w/2, position.y + weather_fontsize/8), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize, a);
    } else if (align == GTextAlignmentLeft) {
        draw_string(fctx, icon, FPoint(position.x, position.y + weather_fontsize/2), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize, a);
    } else {
        draw_string(fctx, icon, FPoint(position.x - w, position.y + weather_fontsize/2), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize, a);
    }
}
/**
 * Draw the watch face.
 */
function background_update_proc(layer, ctx) {
    var fctx_obj;
    var fctx = fctx_obj;
    fctx_init_context(fctx, ctx);
    var bounds = g2frect(layer_get_unobstructed_bounds(layer_background));
    height = bounds.size.h;
    width = bounds.size.w;
    var bounds_full = g2frect(layer_get_bounds(layer_background));
    height_full = bounds_full.size.h;
    width_full = bounds_full.size.w;
    var now = time(NULL);
    var t = localtime(now);
    var color_accent = COLOR(config_color_accent);
    var color_night = GColor.Black;
    var color_day = GColor.LightGray;
    var color_background = GColor.Black;
    var color_main = GColor.White;
    var color_battery = color_main;
    var battery_state = battery_state_service_peek();
    if (battery_state.is_charging || battery_state.is_plugged) {
        battery_state.charge_percent = 100;
    }
    if (battery_state.charge_percent <= 10) {
        color_accent = GColor.Folly;
    } else if (battery_state.charge_percent <= 20) {
        color_accent = GColor.ChromeYellow;
    } else if (battery_state.charge_percent <= 30) {
        color_accent = GColor.Yellow;
    }
    draw_rect(fctx, bounds_full, color_background);
    var fontsize_weather = REM(27);
    var topbar_height = FIXED_ROUND(fontsize_weather + REM(4));
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), color_accent);
    var pos_weather_y = REM(6);
    var weather_is_on = config_weather_refresh > 0;
    var weather_is_available = weather.timestamp > 0;
    var weather_is_outdated = (time(NULL) - weather.timestamp) > (config_weather_expiration * 60);
    var show_weather = weather_is_on && weather_is_available && !weather_is_outdated;
    if (show_weather) {
        if (weather.failed) {
            buffer_1 = sprintf("%c", weather.icon);
            buffer_2 = sprintf("%d", weather.temp_cur);
            buffer_3 = sprintf("%d", weather.temp_low);
            buffer_4 = sprintf("%d", weather.temp_high);
        } else {
            buffer_1 = sprintf("%c", weather.icon);
            buffer_2 = sprintf("%d°", weather.temp_cur);
            buffer_3 = sprintf("%d°", weather.temp_low);
            buffer_4 = sprintf("%d°", weather.temp_high);
        }
        draw_weather(fctx, buffer_1, buffer_2, FPoint(width/2, pos_weather_y), color_background, fontsize_weather, GTextAlignmentCenter);
        draw_string(fctx, buffer_3, FPoint(pos_weather_y + REM(2), pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentLeft);
        draw_string(fctx, buffer_4, FPoint(width - pos_weather_y, pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentRight);
        var first_perc_index = -1;
        var sec_in_hour = 60*60;
        var cur_h_ts = time(NULL);
        cur_h_ts -= cur_h_ts % sec_in_hour; // align with hour
        for(i = 0; i < weather.perc_data_len; i++) {
            if (cur_h_ts == weather.perc_data_ts + i * sec_in_hour) {
                first_perc_index = i;
                break;
            }
        }
        var nHours = 24;
        var all_zero = true;
        for(i = 0; i < nHours + 1; i++) {
            var i_percip_prob = 0;
            if (first_perc_index + i < weather.perc_data_len) {
                i_percip_prob = weather.perc_data[first_perc_index + i];
            }
            if (i_percip_prob != 0) {
                all_zero = false;
                break;
            }
        }
        if (first_perc_index != -1 && !all_zero) {
            var perc_ti_h = FIXED_ROUND(REM(3));
            var perc_sep = REM(2); // space between two bars
            var perc_bar = (width - (nHours + 1) * perc_sep) / nHours; // width of a single bar (without space)
            var perc_w = perc_sep + perc_bar; // total width occupied by a single hour
            var perc_maxheight = REM(20); // max height of the precipitation bar
            var perc_minoffset = - perc_w * (t.tm_min % 60) / 60; // x axis offset into the current hour
            for(i = 0; i < nHours + 1; i++) {
                var i_percip_prob = 0;
                if (first_perc_index + i < weather.perc_data_len) {
                    i_percip_prob = weather.perc_data[first_perc_index + i];
                }
                var point = FPoint(perc_minoffset + perc_sep / 2 + i * perc_w, topbar_height + perc_ti_h);
                var size = FSize(perc_bar, perc_maxheight * i_percip_prob / 100);
                draw_rect(fctx, FRect(point, size), color_main);
            }
            draw_rect(fctx, FRect(FPoint(0, topbar_height), FSize(width, perc_ti_h)), color_day);
            for(i = -1; i < 2; i++) {
                var point = FPoint(perc_minoffset + (24*i + 18 - t.tm_hour) * perc_w, topbar_height);
                draw_rect(fctx, FRect(point, FSize(12 * perc_w, perc_ti_h)), color_night);
            }
        }
    }
    var time_y_offset = PBL_DISPLAY_WIDTH != 144 ? 0 : (height_full-height) / 8;
    setlocale(LC_ALL, "");
    buffer_1 = strftime("%I:%M", new Date());
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_time = (width / 2.2);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time / 2 - time_y_offset), font_main, color_main, fontsize_time, GTextAlignmentCenter);
    buffer_1 = strftime("%A, %m/%d", new Date());
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_date = (width / 8);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, color_accent, fontsize_date, GTextAlignmentCenter);
    var steps = health_service_sum_today(HealthMetricStepCount);
    var steps_goal = 10000;
    var pos_stepbar_height = REM(5);
    var pos_stepbar_endx = width * steps / steps_goal;
    draw_rect(fctx, FRect(FPoint(0, height_full - pos_stepbar_height), FSize(pos_stepbar_endx, pos_stepbar_height)), color_accent);
    draw_circle(fctx, FPoint(pos_stepbar_endx, height_full), pos_stepbar_height, color_accent);
    var hr = health_service_peek_current_value(HealthMetricHeartRateBPM);
    if (hr != 0) {
        var fontsize_hr = REM(25);
        buffer_1 = sprintf("%i", hr);
        draw_string(fctx, "1", FPoint(pos_weather_y, height_full - REM(13)), font_icon, color_main, REM(15), GTextAlignmentLeft);
        draw_string(fctx, buffer_1, FPoint(pos_weather_y + REM(16), height_full - REM(26)), font_main, color_main,fontsize_hr, GTextAlignmentLeft);
    }
    var bat_thickness = PIX(1);
    var bat_gap_thickness = PIX(1);
    var bat_height = PIX(15);
    var bat_width = PIX(9);
    var bat_sep = PIX(3);
    var bat_top = PIX(2);
    var bat_inner_height = bat_height - 2 * bat_thickness - 2 * bat_gap_thickness;
    var bat_inner_width = bat_width - 2 * bat_thickness - 2 * bat_gap_thickness;
    var bat_avoid_stepbar = width - (width * steps / steps_goal + pos_stepbar_height) < 2*bat_sep + bat_width;
    var bat_origin = FPoint(width - bat_sep - bat_width, height_full - bat_sep - bat_height - (bat_avoid_stepbar ? pos_stepbar_height : 0));
    draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), color_battery);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), color_background);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - battery_state.charge_percent) * bat_inner_height / 100), FSize(
            bat_inner_width, battery_state.charge_percent * bat_inner_height / 100)), color_battery);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), color_battery);
    var bluetooth = bluetooth_connection_service_peek();
    bluetooth_popup(fctx, ctx, bluetooth);
    fctx_deinit_context(fctx);
}
// -- end autogen

    var lookKeys = [
        "CONFIG_COLOR_OUTER_BACKGROUND",
        "CONFIG_COLOR_INNER_BACKGROUND",
        "CONFIG_COLOR_MINUTE_HAND",
        "CONFIG_COLOR_INNER_MINUTE_HAND",
        "CONFIG_COLOR_HOUR_HAND",
        "CONFIG_COLOR_INNER_HOUR_HAND",
        "CONFIG_COLOR_CIRCLE",
        "CONFIG_COLOR_TICKS",
        "CONFIG_COLOR_DAY_OF_WEEK",
        "CONFIG_COLOR_DATE",
        "CONFIG_COLOR_BATTERY_LOGO",
        "CONFIG_COLOR_BLUETOOTH_LOGO",
        "CONFIG_COLOR_BLUETOOTH_LOGO_2",
        "CONFIG_COLOR_WEATHER",
        "CONFIG_COLOR_SECONDS",
        "CONFIG_SECONDS",
        "CONFIG_DATE_FORMAT"
    ];
    var chalkLookKeys = [
        "CONFIG_COLOR_INNER_BACKGROUND",
        "CONFIG_COLOR_MINUTE_HAND",
        "CONFIG_COLOR_INNER_MINUTE_HAND",
        "CONFIG_COLOR_HOUR_HAND",
        "CONFIG_COLOR_INNER_HOUR_HAND",
        "CONFIG_COLOR_CIRCLE",
        "CONFIG_COLOR_TICKS",
        "CONFIG_COLOR_DAY_OF_WEEK",
        "CONFIG_COLOR_DATE",
        "CONFIG_COLOR_BATTERY_LOGO",
        "CONFIG_COLOR_WEATHER",
        "CONFIG_COLOR_SECONDS",
        "CONFIG_SECONDS",
        "CONFIG_DATE_FORMAT"
    ];

    function getLookKeys(platform) {
        if (platform == "chalk") {
            return chalkLookKeys;
        }
        return lookKeys;
    }

    /** Return a string that identifies this look. */
    function lookSignature(platform, config) {
        var keys = getLookKeys(platform);
        var s = "";
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            s += key;
            s += config[key];
        }
        return s;
    }

    /** Return a default configuration, that has the look of config. */
    function filterLook(platform, config) {
        var res = defaultConfig(platform);
        var keys = getLookKeys(platform);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            res[key] = config[key];
        }
        return res;
    }

    /** Is this configuration a default configuration? */
    function isDefaultLook(platform, config) {
        return sameLook(platform, defaultConfig(platform), b);
    }

    /** Do these two configurations look the same? */
    function sameLook(platform, a, b) {
        var keys = getLookKeys(platform);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (a[key] != b[key]) return false;
        }
        return true;
    }

    function defaultConfig(platform) {
        var COLOR_FALLBACK = PebbleHelper.COLOR_FALLBACK(platform);
        var PBL_IF_ROUND_ELSE = PebbleHelper.PBL_IF_ROUND_ELSE(platform);
        var defaults = {
// -- autogen
// -- ## for key in configuration
// --             {{ key["key"] }}: {{ key["jsdefault"] }},
// -- ## endfor
            CONFIG_VIBRATE_DISCONNECT: +true,
            CONFIG_VIBRATE_RECONNECT: +true,
            CONFIG_MESSAGE_DISCONNECT: +true,
            CONFIG_MESSAGE_RECONNECT: +true,
            CONFIG_WEATHER_UNIT_LOCAL: +1,
            CONFIG_WEATHER_SOURCE_LOCAL: +1,
            CONFIG_WEATHER_APIKEY_LOCAL: "",
            CONFIG_WEATHER_LOCATION_LOCAL: "",
            CONFIG_WEATHER_REFRESH: +30,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_COLOR_ACCENT: +GColor.VividCerulean,
// -- end autogen
        };
        return cloneConfig(defaults);
    }

    function cloneConfig(config) {
        var res = {};
        for (k in config) {
            res[k] = config[k];
        }
        return res;
    }

    return {
        filterLook: filterLook,
        sameLook: sameLook,
        isDefaultLook: isDefaultLook,
        lookSignature: lookSignature,
        defaultConfig: defaultConfig,
        drawPreview: function (config, canvasId, platform) {
            var first = !(canvasId in configurations);
            platforms[canvasId] = platform;
            configurations[canvasId] = config;
            if (first) {
                // schedule updates to redraw the configuration in case the fonts aren't loaded yet
                var fontUpdate = function (i) {
                    var timeout = 1000;
                    if (i < 5) {
                        timeout = 500;
                    } else if (i > 10) {
                        timeout = 10000;
                    }
                    if (i > 15) return;
                    setTimeout(function () {
                        drawConfig(canvasId);
                        fontUpdate(i + 1);
                    }, timeout);
                };
                fontUpdate(0);
            }
            drawConfig(canvasId);
        }
    }

}());

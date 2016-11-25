"use strict";

var RedshiftPreview = (function () {

    /** Map from canvasIDs to configurations. */
    var configurations = {};
    /** Map from canvasIDs to extra data. */
    var datas = {};
    /** Map from canvasIDs to platforms. */
    var platforms = {};

    // global variables
    var ctx;
    var canvas;
    var platform;
    var tnow = time(NULL);
    var weather;
    var buffer_1, buffer_2, buffer_3, buffer_4;
    var font_main = 'Open Sans Condensed';
    var font_weather = 'nupe2';
    var font_icon = 'FontAwesome';
    var show_bluetooth_popup = false;
    var layer_background = 0;
    var fontsize_complications;
    var height, width, height_full, width_full;
    var rem_is_pix = false;

// -- autogen
// -- ## for key in configuration
// --      var {{ key["key"] | lower }};
// -- ## endfor
     var config_vibrate_disconnect;
     var config_vibrate_reconnect;
     var config_message_disconnect;
     var config_message_reconnect;
     var config_weather_unit_local;
     var config_weather_rain_local;
     var config_weather_source_local;
     var config_weather_apikey_local;
     var config_weather_location_local;
     var config_weather_refresh;
     var config_weather_expiration;
     var config_color_topbar_bg;
     var config_color_info_below;
     var config_color_info_above;
     var config_color_progress_bar;
     var config_color_progress_bar2;
     var config_color_time;
     var config_color_perc;
     var config_color_bottom_complications;
     var config_color_background;
     var config_color_top_complications;
     var config_color_day;
     var config_color_night;
     var config_advanced_appearance_local;
     var config_complication_1;
     var config_complication_2;
     var config_complication_3;
     var config_complication_4;
     var config_complication_5;
     var config_complication_6;
     var config_progress;
     var config_info_above;
     var config_info_below;
// -- end autogen

    function getWeather() {
        var d = [0.5, 0.4, 0.3, 0, 0, 0, 0, 0, 0.1, 0.12, 0.1, 0.2,0.4,0.45,0.6,1,1,0.2,0,0,0,0,0,0,0,0].map(function(x){return x*100});
        var temp = function (t) {
            return config_weather_unit_local == 1 ? t : 9/5 * t + 32;
        }
        if (!config_weather_rain_local) d = [];
        return {
            version: 0,
            timestamp: time(NULL),
            icon: "a".charCodeAt(0),
            temp_cur: temp(14),
            temp_low: temp(5),
            temp_high: temp(28),
            perc_data: d,
            perc_data_len: d.length,
            perc_data_ts: tnow - (tnow % (60*60)),
            failed: false
        };
    }

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
    function REM(x) { return rem_is_pix ? INT_TO_FIXED(x) : INT_TO_FIXED(x) * PBL_DISPLAY_WIDTH / 200; }
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
        if (font == font_weather) {
            py -= size * 0.2;
        }
        if (font == font_icon) {
            if (str == "1") str = "\uf004";
            if (str == "2") str = "\uf293";
            if (str == "3") str = "\uf294";
            py -= REM(9);
            size *= 0.8;
        }
        py += size*0.75;
        ctx.textAlign = align;
        ctx.fillStyle = to_html_color(color);
        ctx.font = (size/FIXED_POINT_SCALE) + "px '" + font + "'";
        ctx.fillText(str, pos.x/FIXED_POINT_SCALE, py/FIXED_POINT_SCALE);

        // var rect = FRect(pos, FSize(string_width(fctx, str, font, size), size));
        // ctx.strokeStyle = to_html_color(color);
        // ctx.strokeRect(rect.origin.x/FIXED_POINT_SCALE, rect.origin.y/FIXED_POINT_SCALE, rect.size.w/FIXED_POINT_SCALE, rect.size.h/FIXED_POINT_SCALE);
    }
    function string_width(fctx, str, font, size) {
        if (font == font_icon) {
            size *= 0.8;
        }
        ctx.font = (size/FIXED_POINT_SCALE) + "px '" + font + "'";
        var text = ctx.measureText(str);
        return INT_TO_FIXED(text.width);
    }

    function initializeDrawingState(canvasId) {
        var config = configurations[canvasId];
        platform = platforms[canvasId];

        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');

        PBL_IF_ROUND_ELSE = PebbleHelper.PBL_IF_ROUND_ELSE(platform);
        PBL_DISPLAY_WIDTH = PebbleHelper.PBL_DISPLAY_WIDTH(platform);
        PBL_DISPLAY_HEIGHT = PebbleHelper.PBL_DISPLAY_HEIGHT(platform);

// -- autogen
// -- ## for key in configuration
// --         {{ key["key"] | lower }} = config["{{ key["key"] }}"];
// -- ## endfor
        config_vibrate_disconnect = config["CONFIG_VIBRATE_DISCONNECT"];
        config_vibrate_reconnect = config["CONFIG_VIBRATE_RECONNECT"];
        config_message_disconnect = config["CONFIG_MESSAGE_DISCONNECT"];
        config_message_reconnect = config["CONFIG_MESSAGE_RECONNECT"];
        config_weather_unit_local = config["CONFIG_WEATHER_UNIT_LOCAL"];
        config_weather_rain_local = config["CONFIG_WEATHER_RAIN_LOCAL"];
        config_weather_source_local = config["CONFIG_WEATHER_SOURCE_LOCAL"];
        config_weather_apikey_local = config["CONFIG_WEATHER_APIKEY_LOCAL"];
        config_weather_location_local = config["CONFIG_WEATHER_LOCATION_LOCAL"];
        config_weather_refresh = config["CONFIG_WEATHER_REFRESH"];
        config_weather_expiration = config["CONFIG_WEATHER_EXPIRATION"];
        config_color_topbar_bg = config["CONFIG_COLOR_TOPBAR_BG"];
        config_color_info_below = config["CONFIG_COLOR_INFO_BELOW"];
        config_color_info_above = config["CONFIG_COLOR_INFO_ABOVE"];
        config_color_progress_bar = config["CONFIG_COLOR_PROGRESS_BAR"];
        config_color_progress_bar2 = config["CONFIG_COLOR_PROGRESS_BAR2"];
        config_color_time = config["CONFIG_COLOR_TIME"];
        config_color_perc = config["CONFIG_COLOR_PERC"];
        config_color_bottom_complications = config["CONFIG_COLOR_BOTTOM_COMPLICATIONS"];
        config_color_background = config["CONFIG_COLOR_BACKGROUND"];
        config_color_top_complications = config["CONFIG_COLOR_TOP_COMPLICATIONS"];
        config_color_day = config["CONFIG_COLOR_DAY"];
        config_color_night = config["CONFIG_COLOR_NIGHT"];
        config_advanced_appearance_local = config["CONFIG_ADVANCED_APPEARANCE_LOCAL"];
        config_complication_1 = config["CONFIG_COMPLICATION_1"];
        config_complication_2 = config["CONFIG_COMPLICATION_2"];
        config_complication_3 = config["CONFIG_COMPLICATION_3"];
        config_complication_4 = config["CONFIG_COMPLICATION_4"];
        config_complication_5 = config["CONFIG_COMPLICATION_5"];
        config_complication_6 = config["CONFIG_COMPLICATION_6"];
        config_progress = config["CONFIG_PROGRESS"];
        config_info_above = config["CONFIG_INFO_ABOVE"];
        config_info_below = config["CONFIG_INFO_BELOW"];
// -- end autogen

        weather = getWeather(platform);
    }

    function drawComplication(canvasId) {
        var backup = rem_is_pix;
        rem_is_pix = true;

        initializeDrawingState(canvasId);
        var data = datas[canvasId];

        var w = 100;
        var h = 30;
        var sep = REM(5);
        var fctx;
        // unfortunately this line is duplicated
        fontsize_complications = REM(27);

        canvas.height = h;
        canvas.width = w;

        var pos = FPoint(REM(w)/2, sep);
        var foreground_color = GColor.Black;
        var background_color = GColor.White;
        draw_rect(fctx, FRect(FPoint(0, 0), FSize(REM(w), REM(h))), background_color);
        complications[data](fctx, true, pos, GTextAlignmentCenter, foreground_color, background_color);

        rem_is_pix = backup;
    }

    function drawConfig(canvasId, ignored) {
        initializeDrawingState(canvasId);

        canvas.height = PBL_DISPLAY_HEIGHT;
        canvas.width = PBL_DISPLAY_WIDTH;

        background_update_proc(0, 0);
    }

// -- autogen
// -- c_to_js src/complications.c
var complications = [
    complication_empty, // id 0
    complication_weather_cur_temp_icon, // id 1
    complication_weather_low_temp, // id 2
    complication_weather_high_temp, // id 3
    complication_bluetooth_disconly, // id 4
    complication_heartrate_cur, // id 5
    complication_battery_icon, // id 6
];
function complication_empty(fctx, draw, position, align, foreground_color, background_color) {
  return 0;
}
function complication_heartrate_cur(fctx, draw, position, align, foreground_color, background_color) {
  var hr = health_service_peek_current_value(HealthMetricHeartRateBPM);
  if (hr != 0) {
  }
  return 0;
}
function complication_battery_icon(fctx, draw, position, align, foreground_color, background_color) {
  var bat_thickness = PIX(1);
  var bat_gap_thickness = PIX(1);
  var bat_height = PIX(15);
  var bat_width = PIX(9);
  var bat_top = PIX(2);
  var bat_inner_height = bat_height - 2 * bat_thickness - 2 * bat_gap_thickness;
  var bat_inner_width = bat_width - 2 * bat_thickness - 2 * bat_gap_thickness;
  if (!draw) return bat_width;
  var offset = 0;
  if (align == GTextAlignmentCenter) offset = bat_width / 2;
  if (align == GTextAlignmentRight) offset = bat_width;
  var battery_state = battery_state_service_peek();
  var bat_origin = FPoint(FIXED_ROUND(position.x - offset), FIXED_ROUND(position.y + (REM(21)-bat_height)/2));
  draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), foreground_color);
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), background_color);
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - battery_state.charge_percent) * bat_inner_height / 100), FSize(
          bat_inner_width, battery_state.charge_percent * bat_inner_height / 100)), foreground_color);
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), foreground_color);
  return bat_width;
}
function complication_bluetooth_disconly(fctx, draw, position, align, foreground_color, background_color) {
  if (!bluetooth_connection_service_peek()) {
    var fontsize_bt_icon = REM(23);
    if (draw) draw_string(fctx, "2", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "2", font_icon, fontsize_complications);
  }
  return 0;
}
function complication_weather_cur_temp_icon(fctx, draw, position, align, foreground_color, background_color) {
  if (show_weather()) {
    buffer_1 = sprintf("%c", weather.icon);
    if (weather.failed) {
        buffer_2 = sprintf("%d", weather.temp_cur);
    } else {
        buffer_2 = sprintf("%d°", weather.temp_cur);
    }
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_complications, align);
  }
  return 0;
}
function complication_weather_low_temp(fctx, draw, position, align, foreground_color, background_color) {
  if (show_weather()) {
    if (weather.failed) {
        buffer_1 = sprintf("%d", weather.temp_low);
    } else {
        buffer_1 = sprintf("%d°", weather.temp_low);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
    return string_width(fctx, buffer_1, font_main, fontsize_complications);
  }
  return 0;
}
function complication_weather_high_temp(fctx, draw, position, align, foreground_color, background_color) {
  if (show_weather()) {
    if (weather.failed) {
        buffer_1 = sprintf("%d", weather.temp_high);
    } else {
        buffer_1 = sprintf("%d°", weather.temp_high);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
    return string_width(fctx, buffer_1, font_main, fontsize_complications);
  }
  return 0;
}
// -- end autogen

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
    return buffer.replace(new RegExp("([^0-9])0", 'g'), "$1");
}
function draw_weather(fctx, draw, icon, temp, position, color, fontsize, align) {
    var weather_fontsize = (fontsize * 1.15);
    var w1 = string_width(fctx, icon, font_weather, weather_fontsize);
    var w2 = string_width(fctx, temp, font_main, fontsize);
    var sep = REM(2);
    var w = w1 + w2 + sep;
    var a = GTextAlignmentLeft;
    if (draw) {
        var icon_y = position.y + weather_fontsize/8;
        if (align == GTextAlignmentCenter) {
            draw_string(fctx, icon, FPoint(position.x - w/2, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize, a);
        } else if (align == GTextAlignmentLeft) {
            draw_string(fctx, icon, FPoint(position.x, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize, a);
        } else {
            draw_string(fctx, icon, FPoint(position.x - w, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize, a);
        }
    }
    return w;
}
/** Should the weather information be shown (based on whether it's enabled, available and up-to-date). */
function show_weather() {
  var weather_is_on = config_weather_refresh > 0;
  var weather_is_available = weather.timestamp > 0;
  var weather_is_outdated = (time(NULL) - weather.timestamp) > (config_weather_expiration * 60);
  var show_weather = weather_is_on && weather_is_available && !weather_is_outdated;
  return show_weather;
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
    fontsize_complications = REM(27);
    var now = time(NULL);
    var t = localtime(now);
    var battery_state = battery_state_service_peek();
    if (battery_state.is_charging || battery_state.is_plugged) {
        battery_state.charge_percent = 100;
    }
    if (battery_state.charge_percent <= 10) {
      config_color_topbar_bg = GColor.Folly;
      config_color_info_below = GColor.Folly;
      config_color_info_above = GColor.Folly;
      config_color_progress_bar = GColor.Folly;
    } else if (battery_state.charge_percent <= 20) {
      config_color_topbar_bg = GColor.ChromeYellow;
      config_color_info_below = GColor.ChromeYellow;
      config_color_info_above = GColor.ChromeYellow;
      config_color_progress_bar = GColor.ChromeYellow;
    } else if (battery_state.charge_percent <= 30) {
      config_color_topbar_bg = GColor.Yellow;
      config_color_info_below = GColor.Yellow;
      config_color_info_above = GColor.Yellow;
      config_color_progress_bar = GColor.Yellow;
    }
    draw_rect(fctx, bounds_full, config_color_background);
    var fontsize_weather = fontsize_complications;
    var topbar_height = FIXED_ROUND(fontsize_weather + REM(4));
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), config_color_topbar_bg);
    if (show_weather()) {
        var first_perc_index = -1;
        var sec_in_hour = 60*60;
        var cur_h_ts = time(NULL);
        cur_h_ts -= cur_h_ts % sec_in_hour; // align with hour
        for(var i = 0; i < weather.perc_data_len; i++) {
            if (cur_h_ts == weather.perc_data_ts + i * sec_in_hour) {
                first_perc_index = i;
                break;
            }
        }
        var nHours = 24;
        var all_zero = true;
        for(var i = 0; i < nHours + 1; i++) {
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
            for(var i = 0; i < nHours + 1; i++) {
                var i_percip_prob = 0;
                if (first_perc_index + i < weather.perc_data_len) {
                    i_percip_prob = weather.perc_data[first_perc_index + i];
                }
                var point = FPoint(perc_minoffset + perc_sep / 2 + i * perc_w, topbar_height + perc_ti_h);
                var size = FSize(perc_bar, perc_maxheight * i_percip_prob / 100);
                draw_rect(fctx, FRect(point, size), config_color_perc);
            }
            draw_rect(fctx, FRect(FPoint(0, topbar_height), FSize(width, perc_ti_h)), config_color_day);
            for(var i = -1; i < 2; i++) {
                var point = FPoint(perc_minoffset + (24*i + 18 - t.tm_hour) * perc_w, topbar_height);
                draw_rect(fctx, FRect(point, FSize(12 * perc_w, perc_ti_h)), config_color_night);
            }
        }
    }
    var time_y_offset = PBL_DISPLAY_WIDTH != 144 ? 0 : (height_full-height) / 8;
    setlocale(LC_ALL, "");
    buffer_1 = strftime("%I:0%M", new Date());
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_time = (width / 2.2);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time / 2 - time_y_offset), font_main, config_color_time, fontsize_time, GTextAlignmentCenter);
    buffer_1 = strftime(config_info_below, new Date());
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_date = (width / 8);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, config_color_info_below, fontsize_date, GTextAlignmentCenter);
    var progress_cur = 0;
    var progress_max = 10000;
    var progress_no = config_progress == 0;
    if (config_progress == 1) {
        progress_cur = health_service_sum_today(HealthMetricStepCount);
        progress_max = 10000;
    } else if (config_progress == 2) {
        progress_cur = battery_state.charge_percent;
        progress_max = 100;
    }
    var progress_height = REM(5);
    var progress_endx = width * progress_cur / progress_max;
    if (!progress_no) {
        draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx, progress_height)), config_color_progress_bar);
        draw_circle(fctx, FPoint(progress_endx, height_full), progress_height, config_color_progress_bar);
        if (progress_cur > progress_max) {
            var progress_endx2 = width * (progress_cur - progress_max) / progress_max;
            draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx2, progress_height)), config_color_progress_bar2);
            draw_circle(fctx, FPoint(progress_endx2, height_full), progress_height, config_color_progress_bar2);
        }
    }
    var complications_margin_topbottom = REM(6); // gap between watch bounds and complications
    var complications_margin_leftright = REM(8);
    complications[config_complication_1](fctx, true, FPoint(complications_margin_leftright, complications_margin_topbottom), GTextAlignmentLeft, config_color_top_complications, config_color_topbar_bg);
    complications[config_complication_2](fctx, true, FPoint(width/2, complications_margin_topbottom), GTextAlignmentCenter, config_color_top_complications, config_color_topbar_bg);
    complications[config_complication_3](fctx, true, FPoint(width - complications_margin_leftright, complications_margin_topbottom), GTextAlignmentRight, config_color_top_complications, config_color_topbar_bg);
    var compl_y = height_full - fontsize_complications;
    var compl_y2 = compl_y - progress_height;
    var compl_w;
    var avoid_progress;
    complications[config_complication_4](fctx, true, FPoint(complications_margin_leftright, progress_no ? compl_y : compl_y2), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    compl_w = complications[config_complication_5](fctx, false, FPoint(0,0), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    avoid_progress = width/2 - compl_w/2 < progress_endx + REM(5);
    complications[config_complication_5](fctx, true, FPoint(width/2, avoid_progress ? compl_y2 : compl_y), GTextAlignmentCenter, config_color_bottom_complications, config_color_background);
    compl_w = complications[config_complication_6](fctx, false, FPoint(0,0), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    avoid_progress = width - complications_margin_leftright - compl_w < progress_endx + REM(5);
    complications[config_complication_6](fctx, true, FPoint(width - complications_margin_leftright, avoid_progress ? compl_y2 : compl_y), GTextAlignmentRight, config_color_bottom_complications, config_color_background);
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
            CONFIG_WEATHER_RAIN_LOCAL: +true,
            CONFIG_WEATHER_SOURCE_LOCAL: +1,
            CONFIG_WEATHER_APIKEY_LOCAL: "",
            CONFIG_WEATHER_LOCATION_LOCAL: "",
            CONFIG_WEATHER_REFRESH: +30,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_COLOR_TOPBAR_BG: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_BELOW: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_ABOVE: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR2: +GColor.White,
            CONFIG_COLOR_TIME: +GColor.White,
            CONFIG_COLOR_PERC: +GColor.White,
            CONFIG_COLOR_BOTTOM_COMPLICATIONS: +GColor.White,
            CONFIG_COLOR_BACKGROUND: +GColor.Black,
            CONFIG_COLOR_TOP_COMPLICATIONS: +GColor.Black,
            CONFIG_COLOR_DAY: +GColor.LightGray,
            CONFIG_COLOR_NIGHT: +GColor.Black,
            CONFIG_ADVANCED_APPEARANCE_LOCAL: +false,
            CONFIG_COMPLICATION_1: +2,
            CONFIG_COMPLICATION_2: +1,
            CONFIG_COMPLICATION_3: +3,
            CONFIG_COMPLICATION_4: +5,
            CONFIG_COMPLICATION_5: +4,
            CONFIG_COMPLICATION_6: +6,
            CONFIG_PROGRESS: +1,
            CONFIG_INFO_ABOVE: "",
            CONFIG_INFO_BELOW: "%A, %m/%d",
// -- end autogen
        };
        return cloneConfig(defaults);
    }

    function cloneConfig(config) {
        var res = {};
        for (var k in config) {
            res[k] = config[k];
        }
        return res;
    }

    function drawHelper(f, config, canvasId, platform, data) {
        var first = !(canvasId in configurations);
        platforms[canvasId] = platform;
        configurations[canvasId] = config;
        datas[canvasId] = data;
        if (first) {
            // schedule updates to redraw the configuration in case the fonts aren't loaded yet
            var fontUpdate = function (f, i) {
                var timeout = 1000;
                if (i < 5) {
                    timeout = 500;
                } else if (i > 10) {
                    timeout = 10000;
                }
                if (i > 15) return;
                setTimeout(function () {
                    f(canvasId);
                    fontUpdate(f, i + 1);
                }, timeout);
            };
            fontUpdate(f, 0);
        }
        f(canvasId);
    }

    return {
        filterLook: filterLook,
        sameLook: sameLook,
        isDefaultLook: isDefaultLook,
        lookSignature: lookSignature,
        defaultConfig: defaultConfig,
        drawPreview: function (config, canvasId, platform) {
            drawHelper(drawConfig, config, canvasId, platform, null);
        },
        previewComplication: function (complication, config, canvasId, platform) {
            drawHelper(drawComplication, config, canvasId, platform, complication);
        },
    }

}());

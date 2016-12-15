"use strict";

var RedshiftPreview = (function () {

    /** Map from canvasIDs to configurations, platform and other info. */
    var datas = {};

    var default_state = {
      weather: {
        low: 11,
        now: 21,
        high: 26,
        icon: "a",
      },
      rain: [50, 40, 30, 0, 0, 0, 0, 0, 10, 12, 10, 20, 40, 45, 60, 100, 100, 20, 0, 0, 0, 0, 0, 0, 0, 0],
      time: function() {
        return Math.round((new Date()) / 1000);
      },
      bluetooth: false,
      battery: 70,
      quiet_time: true,
      steps: 7123,
      steps_daily: 8546,
    };

    // global variables
    var ctx;
    var canvas;
    var state;
    var platform;
    var tnow = time(NULL);
    var weather;
    var buffer_1, buffer_2, buffer_3, buffer_4;
    var font_main = 'Open Sans Condensed';
    var font_weather = 'nupe2';
    var font_icon = 'fasubset';
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
     var config_weather_refresh_failed;
     var config_color_topbar_bg;
     var config_color_info_below;
     var config_color_progress_bar;
     var config_color_progress_bar2;
     var config_color_time;
     var config_color_perc;
     var config_color_bottom_complications;
     var config_color_background;
     var config_color_top_complications;
     var config_color_day;
     var config_color_night;
     var config_color_bat_30;
     var config_color_bat_20;
     var config_color_bat_10;
     var config_lowbat_col;
     var config_advanced_appearance_local;
     var config_complication_1;
     var config_complication_2;
     var config_complication_3;
     var config_complication_4;
     var config_complication_5;
     var config_complication_6;
     var config_progress;
     var config_time_format;
     var config_info_below;
     var config_update_second;
     var config_advanced_format_local;
     var config_time_format_local;
     var config_info_below_local;
     var config_show_daynight;
     var config_step_goal;
// -- end autogen

    function get(k) {
      var statel = state;
      if (typeof state == 'undefined') statel = default_state;
      var x = statel[k];
      if (typeof x == 'function') return x.call();
      return x;
    }

    function getWeather() {
        var d = get('rain');
        var temp = function (t) {
            return config_weather_unit_local == 1 ? t : 9/5 * t + 32;
        }
        if (!config_weather_rain_local) d = [];
        return {
            version: 0,
            timestamp: time(NULL),
            icon: get('weather').icon.charCodeAt(0),
            temp_cur: temp(get('weather').now),
            temp_low: temp(get('weather').low),
            temp_high: temp(get('weather').high),
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
    var IF_HR;

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
    function REM(x) { return (rem_is_pix ? INT_TO_FIXED(x) : INT_TO_FIXED(x) * PBL_DISPLAY_WIDTH / 200); }
    function PIX(x) { return INT_TO_FIXED(x); }
    function FIXED_TO_INT(x) { return Math.floor(x/FIXED_POINT_SCALE); }
    function FIXED_ROUND(x) { return ((x) % FIXED_POINT_SCALE < FIXED_POINT_SCALE/2 ? (x) - ((x) % FIXED_POINT_SCALE) : (x) + FIXED_POINT_SCALE - ((x) % FIXED_POINT_SCALE)) }
    function fctx_init_context() {}
    function fctx_deinit_context() {}
    function layer_get_unobstructed_bounds() { return layer_get_bounds(); }
    function layer_get_bounds() { return GRect(0, 0, PBL_DISPLAY_WIDTH, PBL_DISPLAY_HEIGHT); }
    function time() {
      return get('time')
    }
    function localtime() {
        var d = new Date(get('time')*1000);
        return {
            tm_min: d.getMinutes(),
            tm_hour: d.getHours()
        }
    }
    function setlocale() {}
    var LC_ALL = 0;
    function COLOR(x) { return x; }
    function to_html_color(x) { return '#' + GColor.toHex(x); }
    function battery_state_service_peek() {
        return {
            charge_percent: get('battery'),
            is_charging: false,
            is_plugged: false
        }
    }
    function sizeof() { return 0; }
    var HealthMetricStepCount = 0;
    var HealthMetricActiveSeconds = 1;
    var HealthMetricWalkedDistanceMeters = 2;
    var HealthMetricSleepSeconds = 3;
    var HealthMetricSleepRestfulSeconds = 4;
    var HealthMetricRestingKCalories = 5;
    var HealthMetricActiveKCalories = 6;
    var HealthMetricHeartRateBPM = 7;
    var HealthMetricRestingHeartRateBPM = 8;
    function health_service_sum_today(what) {
        if (what == HealthMetricStepCount) return get('steps');
        if (what == HealthMetricActiveSeconds) return 2*60*60+683;
        if (what == HealthMetricWalkedDistanceMeters) return get('steps')*0.7;
        if (what == HealthMetricSleepSeconds) return 6*60*60+20*60+31;
        if (what == HealthMetricSleepRestfulSeconds) return 1*60*60+58*60+2;
        if (what == HealthMetricRestingKCalories) return 1350;
        if (what == HealthMetricActiveKCalories) return 3891;
        console.log("ERROR: unknown argument: " + what)
    }
    var HealthServiceTimeScopeDailyWeekdayOrWeekend = 100;
    function health_service_sum_averaged(what) {
        if (what == HealthMetricStepCount) return get('steps_daily');
        console.log("ERROR: unknown argument: " + what)
    }
    function quiet_time_is_active() {
        return get('quiet_time');
    }
    var SECONDS_PER_DAY = 60*60*24;
    function time_start_of_today() {
        return 0;
    }
    function health_service_peek_current_value(what) {
        if (what == HealthMetricHeartRateBPM) {
            if (platform == "basalt") return 0;
            return 65;
        }
        console.log("ERROR: unknown argument: " + what)
    }
    function bluetooth_connection_service_peek() { return get('bluetooth'); }
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
        var config = datas[canvasId].config;
        platform = datas[canvasId].platform;
        state = datas[canvasId].state;

        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');

        PBL_IF_ROUND_ELSE = PebbleHelper.PBL_IF_ROUND_ELSE(platform);
        PBL_DISPLAY_WIDTH = PebbleHelper.PBL_DISPLAY_WIDTH(platform);
        PBL_DISPLAY_HEIGHT = PebbleHelper.PBL_DISPLAY_HEIGHT(platform);
        IF_HR = PebbleHelper.IF_HR(platform);

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
        config_weather_refresh_failed = config["CONFIG_WEATHER_REFRESH_FAILED"];
        config_color_topbar_bg = config["CONFIG_COLOR_TOPBAR_BG"];
        config_color_info_below = config["CONFIG_COLOR_INFO_BELOW"];
        config_color_progress_bar = config["CONFIG_COLOR_PROGRESS_BAR"];
        config_color_progress_bar2 = config["CONFIG_COLOR_PROGRESS_BAR2"];
        config_color_time = config["CONFIG_COLOR_TIME"];
        config_color_perc = config["CONFIG_COLOR_PERC"];
        config_color_bottom_complications = config["CONFIG_COLOR_BOTTOM_COMPLICATIONS"];
        config_color_background = config["CONFIG_COLOR_BACKGROUND"];
        config_color_top_complications = config["CONFIG_COLOR_TOP_COMPLICATIONS"];
        config_color_day = config["CONFIG_COLOR_DAY"];
        config_color_night = config["CONFIG_COLOR_NIGHT"];
        config_color_bat_30 = config["CONFIG_COLOR_BAT_30"];
        config_color_bat_20 = config["CONFIG_COLOR_BAT_20"];
        config_color_bat_10 = config["CONFIG_COLOR_BAT_10"];
        config_lowbat_col = config["CONFIG_LOWBAT_COL"];
        config_advanced_appearance_local = config["CONFIG_ADVANCED_APPEARANCE_LOCAL"];
        config_complication_1 = config["CONFIG_COMPLICATION_1"];
        config_complication_2 = config["CONFIG_COMPLICATION_2"];
        config_complication_3 = config["CONFIG_COMPLICATION_3"];
        config_complication_4 = config["CONFIG_COMPLICATION_4"];
        config_complication_5 = config["CONFIG_COMPLICATION_5"];
        config_complication_6 = config["CONFIG_COMPLICATION_6"];
        config_progress = config["CONFIG_PROGRESS"];
        config_time_format = config["CONFIG_TIME_FORMAT"];
        config_info_below = config["CONFIG_INFO_BELOW"];
        config_update_second = config["CONFIG_UPDATE_SECOND"];
        config_advanced_format_local = config["CONFIG_ADVANCED_FORMAT_LOCAL"];
        config_time_format_local = config["CONFIG_TIME_FORMAT_LOCAL"];
        config_info_below_local = config["CONFIG_INFO_BELOW_LOCAL"];
        config_show_daynight = config["CONFIG_SHOW_DAYNIGHT"];
        config_step_goal = config["CONFIG_STEP_GOAL"];
// -- end autogen

        weather = getWeather(platform);
    }

    function drawComplication(canvasId) {
        var backup = rem_is_pix;
        rem_is_pix = true;

        initializeDrawingState(canvasId);
        var complication_id = datas[canvasId].extra;

        var w = 100;
        var h = 30;
        var sep = REM(5);
        var fctx;
// -- autogen
// --         fontsize_complications = REM({{ fontsize_complications }});
        fontsize_complications = REM(27);
// -- end autogen

        canvas.height = h;
        canvas.width = w;

        var pos = FPoint(REM(w)/2, sep);
        var foreground_color = GColor.Black;
        var background_color = GColor.White;
        draw_rect(fctx, FRect(FPoint(0, 0), FSize(REM(w), REM(h))), background_color);
        complications[complication_id](fctx, true, pos, GTextAlignmentCenter, foreground_color, background_color);

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
    complication_bluetooth_disconly_alt, // id 5
    complication_bluetooth_yesno, // id 6
    complication_battery_icon, // id 7
    complication_quiet_offonly, // id 8
    complication_quiet, // id 9
    complication_heartrate_cur_icon, // id 10
    complication_heartrate_cur, // id 11
    complication_steps_icon, // id 12
    complication_steps, // id 13
    complication_steps_short_icon, // id 14
    complication_steps_short, // id 15
    complication_calories_resting_icon, // id 16
    complication_calories_resting, // id 17
    complication_calories_active_icon, // id 18
    complication_calories_active, // id 19
    complication_calories_all_icon, // id 20
    complication_calories_all, // id 21
    complication_calories_resting_short_icon, // id 22
    complication_calories_resting_short, // id 23
    complication_calories_active_short_icon, // id 24
    complication_calories_active_short, // id 25
    complication_calories_all_short_icon, // id 26
    complication_calories_all_short, // id 27
    complication_ampm, // id 28
    complication_ampm_lower, // id 29
    complication_seconds, // id 30
    complication_day_of_week, // id 31
];
function draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, icon, text, show_icon) {
  var fontsize_icon = (fontsize_complications * 0.62);
  var w1 = !show_icon ? 0 : string_width(fctx, icon, font_icon, fontsize_icon);
  var w2 = string_width(fctx, text, font_main, fontsize_complications);
  var sep = REM(2);
  var w = w1 + w2 + sep;
  var a = GTextAlignmentLeft;
  var color = foreground_color;
  if (draw) {
      var icon_y = position.y + fontsize_icon*0.8;
      if (align == GTextAlignmentCenter) {
          if (w1) draw_string(fctx, icon, FPoint(position.x - w/2, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize_complications, a);
      } else if (align == GTextAlignmentLeft) {
          if (w1) draw_string(fctx, icon, FPoint(position.x, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize_complications, a);
      } else {
          if (w1) draw_string(fctx, icon, FPoint(position.x - w, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize_complications, a);
      }
  }
  return w;
}
function format_unitless(num) {
  buffer_1 = sprintf("%d", num);
  return buffer_1;
}
function format_thousands(num) {
  if (num < 1000) {
    return format_unitless(num);
  }
  if (num < 10000) {
    var thousands = num/1000;
    var rest = (num % 1000) / 100;
    if (rest == 0) {
      buffer_1 = sprintf("%dk", thousands);
    } else {
      buffer_1 = sprintf("%d.%dk", thousands, rest);
    }
  } else {
    buffer_1 = sprintf("%dk", num/1000);
  }
  return buffer_1;
}
function complication_empty(fctx, draw, position, align, foreground_color, background_color) {
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
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "H", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "H", font_icon, fontsize_complications);
  }
  return 0;
}
function complication_bluetooth_disconly_alt(fctx, draw, position, align, foreground_color, background_color) {
  if (!bluetooth_connection_service_peek()) {
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "I", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "I", font_icon, fontsize_complications);
  }
  return 0;
}
function complication_bluetooth_yesno(fctx, draw, position, align, foreground_color, background_color) {
  var fontsize_bt_icon = REM(25);
  var icon = "DH";
  if (!bluetooth_connection_service_peek()) {
    icon = "BH";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}
function complication_quiet_offonly(fctx, draw, position, align, foreground_color, background_color) {
  if (quiet_time_is_active()) {
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "F", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "F", font_icon, fontsize_bt_icon);
  }
  return 0;
}
function complication_quiet(fctx, draw, position, align, foreground_color, background_color) {
  var fontsize_bt_icon = REM(25);
  var icon = "G";
  if (quiet_time_is_active()) {
    icon = "F";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}
function complication_ampm(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  setlocale(LC_ALL, "");
  buffer_1 = strftime("%p", new Date(now * 1000));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}
function complication_ampm_lower(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  setlocale(LC_ALL, "");
  buffer_1 = strftime("%P", new Date(now * 1000));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}
function complication_seconds(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  setlocale(LC_ALL, "");
  buffer_1 = strftime("%S", new Date(now * 1000));
  buffer_1 = 
  remove_leading_zero(buffer_1, sizeof(buffer_1));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}
function complication_day_of_week(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  setlocale(LC_ALL, "");
  buffer_1 = strftime("%a", new Date(now * 1000));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
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
function complication_heartrate_cur_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "J", format_unitless(health_service_peek_current_value(HealthMetricHeartRateBPM)), true);
}
function complication_heartrate_cur(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "J", format_unitless(health_service_peek_current_value(HealthMetricHeartRateBPM)), false);
}
function complication_steps_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), true);
}
function complication_steps(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), false);
}
function complication_steps_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), true);
}
function complication_steps_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), false);
}
function complication_calories_resting_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), true);
}
function complication_calories_resting(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), false);
}
function complication_calories_active_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), true);
}
function complication_calories_active(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), false);
}
function complication_calories_all_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true);
}
function complication_calories_all(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false);
}
function complication_calories_resting_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), true);
}
function complication_calories_resting_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), false);
}
function complication_calories_active_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), true);
}
function complication_calories_active_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), false);
}
function complication_calories_all_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true);
}
function complication_calories_all_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false);
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
    var h = FIXED_ROUND(REM(60));
    var rh_size = REM(40);
    draw_rect(fctx, FRect(FPoint(0, 0), FSize(width, h + PIX(2))), GColor.Black);
    draw_rect(fctx, FRect(FPoint(0, 0), FSize(width, h)), GColor.White);
    draw_rect(fctx, FRect(FPoint(width-rh_size, 0), FSize(rh_size, h)), GColor.VividCerulean);
    var fs = REM(23);
    var str2 = connected ? "Connected" : "Disconnected";
    draw_string(fctx, "Bluetooth", FPoint((width - rh_size)/2, REM(7)), font_main, GColor.Black, fs, GTextAlignmentCenter);
    draw_string(fctx, str2, FPoint((width - rh_size)/2, REM(35)), font_main, GColor.Black, fs, GTextAlignmentCenter);
    draw_string(fctx, connected ? "D" : "B", FPoint(width - REM(20), REM(30)), font_icon, GColor.Black, REM(30), GTextAlignmentCenter);
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
function find_fontsize(fctx, target, min, str) {
    var l = min;
    var h = target;
    var border = REM(20);
    if (string_width(fctx, str, font_main, target) <= width - border) {
        return target;
    }
    while (l != h) {
        var m = Math.floor((l + h) / 2);
        if (string_width(fctx, str, font_main, m) > width - border) {
            h = m;
        } else {
            l = m + 1;
        }
    }
    return l;
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
    if (config_lowbat_col) {
        if (battery_state.charge_percent <= 10) {
          config_color_topbar_bg = config_color_bat_10;
          config_color_info_below = config_color_bat_10;
          config_color_progress_bar = config_color_bat_10;
        } else if (battery_state.charge_percent <= 20) {
          config_color_topbar_bg = config_color_bat_20;
          config_color_info_below = config_color_bat_20;
          config_color_progress_bar = config_color_bat_20;
        } else if (battery_state.charge_percent <= 30) {
          config_color_topbar_bg = config_color_bat_30;
          config_color_info_below = config_color_bat_30;
          config_color_progress_bar = config_color_bat_30;
        }
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
            var perc_ti_h = config_show_daynight ? FIXED_ROUND(REM(3)) : 0;
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
            if (config_show_daynight) {
                draw_rect(fctx, FRect(FPoint(0, topbar_height), FSize(width, perc_ti_h)), config_color_day);
                for(var i = -1; i < 2; i++) {
                    var point = FPoint(perc_minoffset + (24*i + 18 - t.tm_hour) * perc_w, topbar_height);
                    draw_rect(fctx, FRect(point, FSize(12 * perc_w, perc_ti_h)), config_color_night);
                }
            }
        }
    }
    var time_y_offset = PBL_DISPLAY_WIDTH != 144 ? 0 : (height_full-height) / 8;
    setlocale(LC_ALL, "");
    buffer_1 = strftime(config_time_format, new Date(now * 1000));
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_time = (width / 2.2);
    var fontsize_time_real = find_fontsize(fctx, fontsize_time, REM(15), buffer_1);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time_real / 2 - time_y_offset), font_main, config_color_time, fontsize_time_real, GTextAlignmentCenter);
    buffer_1 = strftime(config_info_below, new Date(now * 1000));
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_date = REM(28);
    var fontsize_date_real = find_fontsize(fctx, fontsize_date, REM(15), buffer_1);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, config_color_info_below, fontsize_date_real, GTextAlignmentCenter);
    var progress_cur = 0;
    var progress_max = 0;
    var progress_no = config_progress == 0;
    if (config_progress == 1) {
        progress_cur = health_service_sum_today(HealthMetricStepCount);
        progress_max = config_step_goal == 0 ? health_service_sum_averaged(HealthMetricStepCount, time_start_of_today(), time_start_of_today() + SECONDS_PER_DAY, HealthServiceTimeScopeDailyWeekdayOrWeekend) : config_step_goal;
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
        var IF_HR = PebbleHelper.IF_HR(platform);
        var defaults = {
// -- autogen
// -- ## for key in configuration
// --             {{ key["key"] }}: {{ key["jsdefault"] }},
// -- ## endfor
            CONFIG_VIBRATE_DISCONNECT: +true,
            CONFIG_VIBRATE_RECONNECT: +true,
            CONFIG_MESSAGE_DISCONNECT: +true,
            CONFIG_MESSAGE_RECONNECT: +true,
            CONFIG_WEATHER_UNIT_LOCAL: +2,
            CONFIG_WEATHER_RAIN_LOCAL: +true,
            CONFIG_WEATHER_SOURCE_LOCAL: +1,
            CONFIG_WEATHER_APIKEY_LOCAL: "",
            CONFIG_WEATHER_LOCATION_LOCAL: "",
            CONFIG_WEATHER_REFRESH: +60,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_WEATHER_REFRESH_FAILED: +30,
            CONFIG_COLOR_TOPBAR_BG: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_BELOW: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR2: +GColor.White,
            CONFIG_COLOR_TIME: +GColor.White,
            CONFIG_COLOR_PERC: +GColor.White,
            CONFIG_COLOR_BOTTOM_COMPLICATIONS: +GColor.White,
            CONFIG_COLOR_BACKGROUND: +GColor.Black,
            CONFIG_COLOR_TOP_COMPLICATIONS: +GColor.Black,
            CONFIG_COLOR_DAY: +GColor.LightGray,
            CONFIG_COLOR_NIGHT: +GColor.Black,
            CONFIG_COLOR_BAT_30: +GColor.Yellow,
            CONFIG_COLOR_BAT_20: +GColor.ChromeYellow,
            CONFIG_COLOR_BAT_10: +GColor.Folly,
            CONFIG_LOWBAT_COL: +false,
            CONFIG_ADVANCED_APPEARANCE_LOCAL: +false,
            CONFIG_COMPLICATION_1: +2,
            CONFIG_COMPLICATION_2: +1,
            CONFIG_COMPLICATION_3: +3,
            CONFIG_COMPLICATION_4: +IF_HR(10, 14),
            CONFIG_COMPLICATION_5: +4,
            CONFIG_COMPLICATION_6: +7,
            CONFIG_PROGRESS: +1,
            CONFIG_TIME_FORMAT: "%I:0%M",
            CONFIG_INFO_BELOW: "%A, %m/%d",
            CONFIG_UPDATE_SECOND: +0,
            CONFIG_ADVANCED_FORMAT_LOCAL: +false,
            CONFIG_TIME_FORMAT_LOCAL: +0,
            CONFIG_INFO_BELOW_LOCAL: +0,
            CONFIG_SHOW_DAYNIGHT: +true,
            CONFIG_STEP_GOAL: +10000,
// -- end autogen
        };
        return cloneConfig(defaults);
    }

    function myDefaultConfig(platform) {
        var COLOR_FALLBACK = PebbleHelper.COLOR_FALLBACK(platform);
        var PBL_IF_ROUND_ELSE = PebbleHelper.PBL_IF_ROUND_ELSE(platform);
        var IF_HR = PebbleHelper.IF_HR(platform);
        var defaults = {
// -- autogen
// -- ## for key in configuration
// --             {{ key["key"] }}: {{ key["jsmydefault"] }},
// -- ## endfor
            CONFIG_VIBRATE_DISCONNECT: +true,
            CONFIG_VIBRATE_RECONNECT: +true,
            CONFIG_MESSAGE_DISCONNECT: +true,
            CONFIG_MESSAGE_RECONNECT: +true,
            CONFIG_WEATHER_UNIT_LOCAL: +1,
            CONFIG_WEATHER_RAIN_LOCAL: +true,
            CONFIG_WEATHER_SOURCE_LOCAL: +2,
            CONFIG_WEATHER_APIKEY_LOCAL: "",
            CONFIG_WEATHER_LOCATION_LOCAL: "",
            CONFIG_WEATHER_REFRESH: +60,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_WEATHER_REFRESH_FAILED: +30,
            CONFIG_COLOR_TOPBAR_BG: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_BELOW: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR2: +GColor.White,
            CONFIG_COLOR_TIME: +GColor.White,
            CONFIG_COLOR_PERC: +GColor.White,
            CONFIG_COLOR_BOTTOM_COMPLICATIONS: +GColor.White,
            CONFIG_COLOR_BACKGROUND: +GColor.Black,
            CONFIG_COLOR_TOP_COMPLICATIONS: +GColor.Black,
            CONFIG_COLOR_DAY: +GColor.LightGray,
            CONFIG_COLOR_NIGHT: +GColor.Black,
            CONFIG_COLOR_BAT_30: +GColor.Yellow,
            CONFIG_COLOR_BAT_20: +GColor.ChromeYellow,
            CONFIG_COLOR_BAT_10: +GColor.Folly,
            CONFIG_LOWBAT_COL: +true,
            CONFIG_ADVANCED_APPEARANCE_LOCAL: +false,
            CONFIG_COMPLICATION_1: +2,
            CONFIG_COMPLICATION_2: +1,
            CONFIG_COMPLICATION_3: +3,
            CONFIG_COMPLICATION_4: +IF_HR(10, 14),
            CONFIG_COMPLICATION_5: +4,
            CONFIG_COMPLICATION_6: +7,
            CONFIG_PROGRESS: +1,
            CONFIG_TIME_FORMAT: "%I:0%M",
            CONFIG_INFO_BELOW: "%A, %m/%d",
            CONFIG_UPDATE_SECOND: +0,
            CONFIG_ADVANCED_FORMAT_LOCAL: +false,
            CONFIG_TIME_FORMAT_LOCAL: +0,
            CONFIG_INFO_BELOW_LOCAL: +0,
            CONFIG_SHOW_DAYNIGHT: +true,
            CONFIG_STEP_GOAL: +10000,
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

    function drawHelper(f, config, canvasId, platform, extra, state) {
        var first = !(canvasId in datas);
        datas[canvasId] = {
          config: config,
          platform: platform,
          extra: extra,
          state: state,
        };
        if (first) {
            // schedule updates to redraw the configuration in case the fonts aren't loaded yet
            var fontUpdate = function (f, i) {
                var timeout = 100;
                if (i > 10) timeout = 1000;
                if (i > 20) return;
                setTimeout(function () {
                    f(canvasId);
                    fontUpdate(f, i + 1);
                }, timeout);
            };
            fontUpdate(f, 0);
        }
        f(canvasId);
    }

    function override(new_vals, backup_vals) {
      if (typeof new_vals == 'undefined') return backup_vals;
      var res = cloneConfig(backup_vals);
      for (var k in backup_vals) {
        if (k in new_vals) res[k] = new_vals[k];
        else res[k] = backup_vals[k];
      }
      return res;
    }

    return {
        filterLook: filterLook,
        sameLook: sameLook,
        isDefaultLook: isDefaultLook,
        lookSignature: lookSignature,
        defaultConfig: defaultConfig,
        defaultState: function () { return default_state; },
        myDefaultConfig: myDefaultConfig,
        drawPreview: function (config, canvasId, platform, state) {
            drawHelper(drawConfig, config, canvasId, platform, null, state);
        },
        previewComplication: function (complication, config, canvasId, platform, state) {
            drawHelper(drawComplication, config, canvasId, platform, complication, state);
        },
        override: override,
        overrideConfig: function (new_vals, backup_vals) {
          if (typeof new_vals == 'undefined') return backup_vals;
          var res = cloneConfig(backup_vals);
// -- autogen
// -- ## for key in simple_config
// --           if ("{{ key["key"] }}" in new_vals) {
// -- ## for dep in key["depends"]
// --             res["{{ dep }}"] = new_vals["{{ key["key"] }}"];
// -- ## endfor
// --           }
// -- ## endfor
          if ("SIMPLECONFIG_COLOR_MAIN" in new_vals) {
            res["CONFIG_COLOR_TIME"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_PERC"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_BOTTOM_COMPLICATIONS"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_PROGRESS_BAR2"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
          }
          if ("SIMPLECONFIG_COLOR_ACCENT" in new_vals) {
            res["CONFIG_COLOR_TOPBAR_BG"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
            res["CONFIG_COLOR_INFO_BELOW"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
            res["CONFIG_COLOR_PROGRESS_BAR"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
          }
          if ("SIMPLECONFIG_COLOR_BACKGROUND" in new_vals) {
            res["CONFIG_COLOR_BACKGROUND"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_TOP_COMPLICATIONS"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_NIGHT"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
          }
// -- end autogen
          return override(new_vals, res);
        },
    }

}());

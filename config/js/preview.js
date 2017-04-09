"use strict";

var GraphitePreview = (function () {

    /** Map from canvasIDs to configurations, platform and other info. */
    var datas = {};

    var default_state = {
      weather: {
        low: 11,
        now: 21,
        high: 26,
        icon: "a",
        sunrise: Math.round((new Date(2017, 1, 1, 6, 51)) / 1000),
        sunset: Math.round((new Date(2017, 1, 1, 19, 22)) / 1000),
      },
      rain: [20, 0, 10, 12, 10, 20, 40, 45, 60, 100, 100, 20, 0, 0, 0, 0, 0, 0, 0, 50, 40, 30],
      time: function() {
        return Math.round((new Date()) / 1000);
      },
      bluetooth: false,
      battery: 70,
      phone_battery: 30,
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
    var phonebat;
    var buffer_1, buffer_2, buffer_3, buffer_4;
    var font_main = 'Open Sans Condensed';
    var font_weather = 'nupe2';
    var font_icon = 'fasubset';
    var show_bluetooth_popup = false;
    var layer_background = 0;
    var fontsize_widgets;
    var height, width, height_full, width_full;
    var rem_is_pix = false;
    var show_secondary_widgets = false;

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
     var config_color_widget_1;
     var config_color_widget_2;
     var config_color_widget_3;
     var config_color_widget_4;
     var config_color_widget_5;
     var config_color_widget_6;
     var config_color_background;
     var config_color_day;
     var config_color_night;
     var config_color_bat_30;
     var config_color_bat_20;
     var config_color_bat_10;
     var config_lowbat_col;
     var config_advanced_appearance_local;
     var config_widget_1;
     var config_widget_2;
     var config_widget_3;
     var config_widget_4;
     var config_widget_5;
     var config_widget_6;
     var config_progress;
     var config_time_format;
     var config_info_below;
     var config_update_second;
     var config_advanced_format_local;
     var config_time_format_local;
     var config_info_below_local;
     var config_show_daynight;
     var config_step_goal;
     var config_tz_0_local;
     var config_tz_1_local;
     var config_tz_2_local;
     var config_tz_0_format;
     var config_tz_1_format;
     var config_tz_2_format;
     var config_hourly_vibrate;
     var config_sunrise_format;
     var config_widget_7;
     var config_widget_8;
     var config_widget_9;
     var config_widget_10;
     var config_widget_11;
     var config_widget_12;
     var config_timeout_2nd_widgets;
     var config_2nd_widgets;
     var config_weather_sunrise_expiration;
     var config_color_quiet_mode;
     var config_quiet_col;
     var config_phone_battery_expiration;
     var config_phone_battery_refresh;
     var config_update_phonebat_on_shake;
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
        };
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
            sunrise: get('weather').sunrise,
            sunset: get('weather').sunset,
            failed: false
        };
    }
    function getPhoneBat() {
        return {
            version: 0,
            timestamp: time(NULL),
            level: get('phone_battery')
        };
    }

    // core functions and constants
    var PBL_IF_ROUND_ELSE;
    var PBL_DISPLAY_WIDTH;
    var PBL_DISPLAY_HEIGHT;
    var IF_HR;
    var GRAPHITE_UNKNOWN_WEATHER = 32767;

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
    function localtime(t) {
        return new Date(t * 1000);
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
        config_color_widget_1 = config["CONFIG_COLOR_WIDGET_1"];
        config_color_widget_2 = config["CONFIG_COLOR_WIDGET_2"];
        config_color_widget_3 = config["CONFIG_COLOR_WIDGET_3"];
        config_color_widget_4 = config["CONFIG_COLOR_WIDGET_4"];
        config_color_widget_5 = config["CONFIG_COLOR_WIDGET_5"];
        config_color_widget_6 = config["CONFIG_COLOR_WIDGET_6"];
        config_color_background = config["CONFIG_COLOR_BACKGROUND"];
        config_color_day = config["CONFIG_COLOR_DAY"];
        config_color_night = config["CONFIG_COLOR_NIGHT"];
        config_color_bat_30 = config["CONFIG_COLOR_BAT_30"];
        config_color_bat_20 = config["CONFIG_COLOR_BAT_20"];
        config_color_bat_10 = config["CONFIG_COLOR_BAT_10"];
        config_lowbat_col = config["CONFIG_LOWBAT_COL"];
        config_advanced_appearance_local = config["CONFIG_ADVANCED_APPEARANCE_LOCAL"];
        config_widget_1 = config["CONFIG_WIDGET_1"];
        config_widget_2 = config["CONFIG_WIDGET_2"];
        config_widget_3 = config["CONFIG_WIDGET_3"];
        config_widget_4 = config["CONFIG_WIDGET_4"];
        config_widget_5 = config["CONFIG_WIDGET_5"];
        config_widget_6 = config["CONFIG_WIDGET_6"];
        config_progress = config["CONFIG_PROGRESS"];
        config_time_format = config["CONFIG_TIME_FORMAT"];
        config_info_below = config["CONFIG_INFO_BELOW"];
        config_update_second = config["CONFIG_UPDATE_SECOND"];
        config_advanced_format_local = config["CONFIG_ADVANCED_FORMAT_LOCAL"];
        config_time_format_local = config["CONFIG_TIME_FORMAT_LOCAL"];
        config_info_below_local = config["CONFIG_INFO_BELOW_LOCAL"];
        config_show_daynight = config["CONFIG_SHOW_DAYNIGHT"];
        config_step_goal = config["CONFIG_STEP_GOAL"];
        config_tz_0_local = config["CONFIG_TZ_0_LOCAL"];
        config_tz_1_local = config["CONFIG_TZ_1_LOCAL"];
        config_tz_2_local = config["CONFIG_TZ_2_LOCAL"];
        config_tz_0_format = config["CONFIG_TZ_0_FORMAT"];
        config_tz_1_format = config["CONFIG_TZ_1_FORMAT"];
        config_tz_2_format = config["CONFIG_TZ_2_FORMAT"];
        config_hourly_vibrate = config["CONFIG_HOURLY_VIBRATE"];
        config_sunrise_format = config["CONFIG_SUNRISE_FORMAT"];
        config_widget_7 = config["CONFIG_WIDGET_7"];
        config_widget_8 = config["CONFIG_WIDGET_8"];
        config_widget_9 = config["CONFIG_WIDGET_9"];
        config_widget_10 = config["CONFIG_WIDGET_10"];
        config_widget_11 = config["CONFIG_WIDGET_11"];
        config_widget_12 = config["CONFIG_WIDGET_12"];
        config_timeout_2nd_widgets = config["CONFIG_TIMEOUT_2ND_WIDGETS"];
        config_2nd_widgets = config["CONFIG_2ND_WIDGETS"];
        config_weather_sunrise_expiration = config["CONFIG_WEATHER_SUNRISE_EXPIRATION"];
        config_color_quiet_mode = config["CONFIG_COLOR_QUIET_MODE"];
        config_quiet_col = config["CONFIG_QUIET_COL"];
        config_phone_battery_expiration = config["CONFIG_PHONE_BATTERY_EXPIRATION"];
        config_phone_battery_refresh = config["CONFIG_PHONE_BATTERY_REFRESH"];
        config_update_phonebat_on_shake = config["CONFIG_UPDATE_PHONEBAT_ON_SHAKE"];
// -- end autogen

        weather = getWeather(platform);
        phonebat = getPhoneBat(platform);
    }

    function drawComplication(canvasId) {
        var backup = rem_is_pix;
        rem_is_pix = true;

        initializeDrawingState(canvasId);
        var widget_id = datas[canvasId].extra;

        var w = 100;
        var h = 30;
        var sep = REM(5);
        var fctx;
// -- autogen
// --         fontsize_widgets = REM({{ fontsize_widgets }});
        fontsize_widgets = REM(27);
// -- end autogen

        canvas.height = h;
        canvas.width = w;

        var pos = FPoint(REM(w)/2, sep);
        var foreground_color = GColor.Black;
        var background_color = GColor.White;
        draw_rect(fctx, FRect(FPoint(0, 0), FSize(REM(w), REM(h))), background_color);
        widgets[widget_id](fctx, true, pos, GTextAlignmentCenter, foreground_color, background_color);

        rem_is_pix = backup;
    }

    function drawConfig(canvasId, ignored) {
        initializeDrawingState(canvasId);

        canvas.height = PBL_DISPLAY_HEIGHT;
        canvas.width = PBL_DISPLAY_WIDTH;

        background_update_proc(0, 0);
    }

// -- autogen
// -- c_to_js src/widgets.c
var widgets = [
    widget_empty, // id 0
    widget_weather_cur_temp_icon, // id 1
    widget_weather_cur_temp, // id 2
    widget_weather_cur_icon, // id 3
    widget_weather_low_temp, // id 4
    widget_weather_high_temp, // id 5
    widget_bluetooth_disconly, // id 6
    widget_bluetooth_disconly_alt, // id 7
    widget_bluetooth_yesno, // id 8
    widget_battery_icon, // id 9
    widget_quiet_offonly, // id 10
    widget_quiet, // id 11
    widget_steps_icon, // id 12
    widget_steps, // id 13
    widget_steps_short_icon, // id 14
    widget_steps_short, // id 15
    widget_calories_resting_icon, // id 16
    widget_calories_resting, // id 17
    widget_calories_active_icon, // id 18
    widget_calories_active, // id 19
    widget_calories_all_icon, // id 20
    widget_calories_all, // id 21
    widget_calories_resting_short_icon, // id 22
    widget_calories_resting_short, // id 23
    widget_calories_active_short_icon, // id 24
    widget_calories_active_short, // id 25
    widget_calories_all_short_icon, // id 26
    widget_calories_all_short, // id 27
    widget_ampm, // id 28
    widget_ampm_lower, // id 29
    widget_seconds, // id 30
    widget_day_of_week, // id 31
    widget_battery_text, // id 32
    widget_battery_text2, // id 33
    widget_tz_0, // id 34
    widget_tz_1, // id 35
    widget_tz_2, // id 36
    widget_weather_sunrise_icon0, // id 37
    widget_weather_sunrise_icon1, // id 38
    widget_weather_sunrise_icon2, // id 39
    widget_weather_sunset_icon0, // id 40
    widget_weather_sunset_icon1, // id 41
    widget_weather_sunset_icon2, // id 42
    widget_phone_battery_icon, // id 43
    widget_phone_battery_text, // id 44
    widget_phone_battery_text2, // id 45
    widget_both_battery_icon, // id 46
    widget_both_battery_flipped_icon, // id 47
    widget_both_battery_text, // id 48
    widget_both_battery_flipped_text, // id 49
    widget_both_battery_text2, // id 50
    widget_both_battery_flipped_text2, // id 51
];
function widget_tz(fctx, draw, position, align, foreground_color, background_color, tz_id, format) {
    var dat = moment(new Date()).tz(eval("config_tz_" + tz_id + "_local")).format('YYYY-MM-DD HH:mm');
    buffer_1 = strftime(format, new Date(dat));
    buffer_1 =
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function widget_tz_0(fctx, draw, position, align, foreground_color, background_color) {
    return widget_tz(fctx, draw, position, align, foreground_color, background_color, 0, config_tz_0_format);
}
function widget_tz_1(fctx, draw, position, align, foreground_color, background_color) {
    return widget_tz(fctx, draw, position, align, foreground_color, background_color, 1, config_tz_1_format);
}
function widget_tz_2(fctx, draw, position, align, foreground_color, background_color) {
    return widget_tz(fctx, draw, position, align, foreground_color, background_color, 2, config_tz_2_format);
}
function draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, icon, text, show_icon, flip_order) {
  var fontsize_icon = (fontsize_widgets * 31 / 50); // 0.62
  var w1 = !show_icon ? 0 : string_width(fctx, icon, font_icon, fontsize_icon);
  var w2 = string_width(fctx, text, font_main, fontsize_widgets);
  var sep = REM(2);
  var w = w1 + w2 + sep;
  var a = GTextAlignmentLeft;
  var color = foreground_color;
  if (draw) {
      var icon_y = position.y + fontsize_icon*2/5; // 0.4
icon_y += REM(7);
      var offset2 = flip_order ? 0 : w1 + sep;
      var offset1 = flip_order ? w2 + sep : 0;
      if (align == GTextAlignmentCenter) {
          if (w1) {
              var p1 = FPoint(position.x - w / 2 + offset1, icon_y);
              draw_string(fctx, icon, p1, font_icon, color, fontsize_icon, a);
          }
          var p2 = FPoint(position.x - w / 2 + offset2, position.y);
          draw_string(fctx, text, p2, font_main, color, fontsize_widgets, a);
      } else if (align == GTextAlignmentLeft) {
          if (w1) {
              var p1 = FPoint(position.x + offset1, icon_y);
              draw_string(fctx, icon, p1, font_icon, color, fontsize_icon, a);
          }
          var p2 = FPoint(position.x + offset2, position.y);
          draw_string(fctx, text, p2, font_main, color, fontsize_widgets, a);
      } else {
          if (w1) {
              var p1 = FPoint(position.x - w + offset1, icon_y);
              draw_string(fctx, icon, p1, font_icon, color, fontsize_icon, a);
          }
          var p2 = FPoint(position.x - w + offset2, position.y);
          draw_string(fctx, text, p2, font_main, color, fontsize_widgets, a);
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
function widget_empty(fctx, draw, position, align, foreground_color, background_color) {
  return 0;
}
function drawBatText(fctx, draw, position, align, foreground_color, perc, level) {
    buffer_1 = sprintf(perc ? "%d%%" : "%d", level);
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function drawBatText2(fctx, draw, position, align, foreground_color, perc, level, level2) {
    buffer_1 = sprintf(perc ? "%d%% %d%%" : "%d %d", level, level2);
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function drawBat(fctx, draw, position, align, foreground_color, background_color, level) {
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
    var bat_origin = FPoint(FIXED_ROUND(position.x - offset), FIXED_ROUND(
            position.y + (REM(21) - bat_height) / 2));
    draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), foreground_color);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), background_color);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - level) * bat_inner_height / 100), FSize(
            bat_inner_width, level * bat_inner_height / 100)), foreground_color);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), foreground_color);
    return bat_width;
}
function widget_battery_text(fctx, draw, position, align, foreground_color, background_color) {
    return drawBatText(fctx, draw, position, align, foreground_color, true, battery_state_service_peek().charge_percent);
}
function widget_battery_text2(fctx, draw, position, align, foreground_color, background_color) {
    return drawBatText(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent);
}
function widget_battery_icon(fctx, draw, position, align, foreground_color, background_color) {
    return drawBat(fctx, draw, position, align, foreground_color, background_color, battery_state_service_peek().charge_percent);
}
function showPhoneBattery() {
    var battery_is_outdated = (time(NULL) - phonebat.timestamp) > (config_phone_battery_expiration * 60);
    var invalid_bat_level = phonebat.level > 100;
    return !battery_is_outdated && !invalid_bat_level;
}
function widget_phone_battery_text(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return 0;
    return drawBatText(fctx, draw, position, align, foreground_color, true, phonebat.level);
}
function widget_phone_battery_text2(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return 0;
    return drawBatText(fctx, draw, position, align, foreground_color, false, phonebat.level);
}
function widget_phone_battery_icon(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return 0;
    return drawBat(fctx, draw, position, align, foreground_color, background_color, phonebat.level);
}
function widget_both_battery_text(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBatText(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent);
    return drawBatText2(fctx, draw, position, align, foreground_color, true, battery_state_service_peek().charge_percent, phonebat.level);
}
function widget_both_battery_text2(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBatText(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent);
    return drawBatText2(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent, phonebat.level);
}
function widget_both_battery_flipped_text(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBatText(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent);
    return drawBatText2(fctx, draw, position, align, foreground_color, true, phonebat.level, battery_state_service_peek().charge_percent);
}
function widget_both_battery_flipped_text2(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBatText(fctx, draw, position, align, foreground_color, false, battery_state_service_peek().charge_percent);
    return drawBatText2(fctx, draw, position, align, foreground_color, false, phonebat.level, battery_state_service_peek().charge_percent);
}
function widget_both_battery_icon(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBat(fctx, draw, position, align, foreground_color, background_color, battery_state_service_peek().charge_percent);
    var bat_icon_sep = PIX(2);
    var w = PIX(9) * 2 + bat_icon_sep;
    if (!draw) return w;
    if (align == GTextAlignmentCenter) position.x -= w/2;
    if (align == GTextAlignmentRight) position.x -= w;
    drawBat(fctx, draw, position, GTextAlignmentLeft, foreground_color, background_color, battery_state_service_peek().charge_percent);
    position.x += w/2;
    drawBat(fctx, draw, position, GTextAlignmentLeft, foreground_color, background_color, phonebat.level);
    return w;
}
function widget_both_battery_flipped_icon(fctx, draw, position, align, foreground_color, background_color) {
    if (!showPhoneBattery()) return drawBat(fctx, draw, position, align, foreground_color, background_color, battery_state_service_peek().charge_percent);
    var bat_icon_sep = PIX(2);
    var w = PIX(9) * 2 + bat_icon_sep;
    if (!draw) return w;
    if (align == GTextAlignmentCenter) position.x -= w/2;
    if (align == GTextAlignmentRight) position.x -= w;
    drawBat(fctx, draw, position, GTextAlignmentLeft, foreground_color, background_color, phonebat.level);
    position.x += w/2;
    drawBat(fctx, draw, position, GTextAlignmentLeft, foreground_color, background_color, battery_state_service_peek().charge_percent);
    return w;
}
function widget_bluetooth_disconly(fctx, draw, position, align, foreground_color, background_color) {
  if (!bluetooth_connection_service_peek()) {
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "H", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "H", font_icon, fontsize_widgets);
  }
  return 0;
}
function widget_bluetooth_disconly_alt(fctx, draw, position, align, foreground_color, background_color) {
  if (!bluetooth_connection_service_peek()) {
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "I", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "I", font_icon, fontsize_widgets);
  }
  return 0;
}
function widget_bluetooth_yesno(fctx, draw, position, align, foreground_color, background_color) {
  var fontsize_bt_icon = REM(25);
  var icon = "DH";
  if (!bluetooth_connection_service_peek()) {
    icon = "BH";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}
function widget_quiet_offonly(fctx, draw, position, align, foreground_color, background_color) {
  if (quiet_time_is_active()) {
    var fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "F", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "F", font_icon, fontsize_bt_icon);
  }
  return 0;
}
function widget_quiet(fctx, draw, position, align, foreground_color, background_color) {
  var fontsize_bt_icon = REM(25);
  var icon = "G";
  if (quiet_time_is_active()) {
    icon = "F";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}
function widget_ampm(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  buffer_1 = strftime("%p", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function widget_ampm_lower(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  buffer_1 = strftime("%P", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function widget_seconds(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
    var t = localtime(now);
  buffer_1 = strftime("%S", t);
  buffer_1 = 
  remove_leading_zero(buffer_1, sizeof(buffer_1));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function widget_day_of_week(fctx, draw, position, align, foreground_color, background_color) {
  var now = time(NULL);
  var t = localtime(now);
  buffer_1 = strftime("%a", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}
function widget_weather_temp(fctx, draw, position, align, foreground_color, temp) {
  if (show_weather()) {
    if (temp == GRAPHITE_UNKNOWN_WEATHER) return 0;
    if (weather.failed) {
        buffer_1 = sprintf("%d", temp);
    } else {
        buffer_1 = sprintf("%d°", temp);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
  }
  return 0;
}
function widget_weather_cur_temp(fctx, draw, position, align, foreground_color, background_color) {
  return widget_weather_temp(fctx, draw, position, align, foreground_color, weather.temp_cur);
}
function widget_weather_cur_icon(fctx, draw, position, align, foreground_color, background_color) {
  if (show_weather()) {
    if (weather.temp_cur == GRAPHITE_UNKNOWN_WEATHER) return 0;
    buffer_1 = sprintf("%c", weather.icon);
buffer_2 = "";
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_widgets, align, false);
  }
  return 0;
}
function widget_weather_cur_temp_icon(fctx, draw, position, align, foreground_color, background_color) {
  if (show_weather()) {
    if (weather.temp_cur == GRAPHITE_UNKNOWN_WEATHER) return 0;
    buffer_1 = sprintf("%c", weather.icon);
    if (weather.failed) {
        buffer_2 = sprintf("%d", weather.temp_cur);
    } else {
        buffer_2 = sprintf("%d°", weather.temp_cur);
    }
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_widgets, align, false);
  }
  return 0;
}
function widget_weather_low_temp(fctx, draw, position, align, foreground_color, background_color) {
  return widget_weather_temp(fctx, draw, position, align, foreground_color, weather.temp_low);
}
function widget_weather_high_temp(fctx, draw, position, align, foreground_color, background_color) {
  return widget_weather_temp(fctx, draw, position, align, foreground_color, weather.temp_high);
}
function widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, icon, flip, time) {
    if (!show_weather_impl(config_weather_sunrise_expiration * 60)) return 0;
    if (weather.sunrise == 0) return 0;
    var t = localtime(time);
    buffer_1 = strftime(config_sunrise_format, t);
  buffer_1 =
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    return draw_weather(fctx, draw, icon, buffer_1, position, foreground_color, fontsize_widgets, align, flip);
}
function widget_weather_sunrise_icon0(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "", false, weather.sunrise);
}
function widget_weather_sunrise_icon1(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "a", false, weather.sunrise);
}
function widget_weather_sunrise_icon2(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "a", true, weather.sunrise);
}
function widget_weather_sunset_icon0(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "", false, weather.sunset);
}
function widget_weather_sunset_icon1(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "A", false, weather.sunset);
}
function widget_weather_sunset_icon2(fctx, draw, position, align, foreground_color, background_color) {
    return widget_weather_sunrise_sunset(fctx, draw, position, align, foreground_color, "A", true, weather.sunset);
}
function widget_steps_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), true, false);
}
function widget_steps(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), false, false);
}
function widget_steps_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), true, false);
}
function widget_steps_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), false, false);
}
function widget_calories_resting_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), true, false);
}
function widget_calories_resting(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), false, false);
}
function widget_calories_active_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), true, false);
}
function widget_calories_active(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), false, false);
}
function widget_calories_all_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true, false);
}
function widget_calories_all(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false, false);
}
function widget_calories_resting_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), true, false);
}
function widget_calories_resting_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), false, false);
}
function widget_calories_active_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), true, false);
}
function widget_calories_active_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), false, false);
}
function widget_calories_all_short_icon(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true, false);
}
function widget_calories_all_short(fctx, draw, position, align, foreground_color, background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false, false);
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
    buffer = buffer.replace("mmmm", "");
    if (buffer.substring(0, 1) == "0") buffer = buffer.substring(1);
    return buffer.replace(new RegExp("([^0-9])0", 'g'), "$1");
}
function draw_weather(fctx, draw, icon, temp, position, color, fontsize, align, flip_order) {
    var weather_fontsize = (fontsize * 23 / 20); // 1.15
    var w1 = string_width(fctx, icon, font_weather, weather_fontsize);
    var w2 = string_width(fctx, temp, font_main, fontsize);
    var sep = w1 == 0 || w2 == 0 ? REM(0) : REM(2);
    var w = w1 + w2 + sep;
    var a = GTextAlignmentLeft;
    var offset1 = flip_order ? w2 + sep : 0;
    var offset2 = flip_order ? 0 : w1 + sep;
    if (draw) {
        var icon_y = position.y + weather_fontsize/8;
        if (align == GTextAlignmentCenter) {
            draw_string(fctx, icon, FPoint(position.x - w/2 + offset1, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w/2 + offset2, position.y), font_main, color, fontsize, a);
        } else if (align == GTextAlignmentLeft) {
            draw_string(fctx, icon, FPoint(position.x + offset1, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x + offset2, position.y), font_main, color, fontsize, a);
        } else {
            draw_string(fctx, icon, FPoint(position.x - w + offset1, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w + offset2, position.y), font_main, color, fontsize, a);
        }
    }
    return w;
}
/** Should the weather information be shown (based on whether it's enabled, available and up-to-date). */
function show_weather() {
    return show_weather_impl(config_weather_expiration);
}
function show_weather_impl(timeout) {
    var weather_is_on = config_weather_refresh > 0;
    var weather_is_available = weather.timestamp > 0;
    var weather_is_outdated = (time(NULL) - weather.timestamp) > (timeout * 60);
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
    fontsize_widgets = REM(27);
    var now = time(NULL);
    var t = localtime(now);
    var battery_state = battery_state_service_peek();
    if (battery_state.is_charging || battery_state.is_plugged) {
        battery_state.charge_percent = 100;
    }
    var config_color_topbar_bg_local = config_color_topbar_bg;
    var config_color_info_below_local = config_color_info_below;
    var config_color_progress_bar_local = config_color_progress_bar;
    var override_col = -1;
    if (config_lowbat_col) {
        if (battery_state.charge_percent <= 10) {
            override_col = config_color_bat_10;
        } else if (battery_state.charge_percent <= 20) {
            override_col = config_color_bat_20;
        } else if (battery_state.charge_percent <= 30) {
            override_col = config_color_bat_30;
        }
    }
    if (override_col != -1) {
          config_color_topbar_bg_local = override_col;
          config_color_info_below_local = override_col;
          config_color_progress_bar_local = override_col;
    }
    draw_rect(fctx, bounds_full, config_color_background);
    var fontsize_weather = fontsize_widgets;
    var topbar_height = FIXED_ROUND(fontsize_weather + REM(4));
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), config_color_topbar_bg_local);
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
    first_perc_index = 0;
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
    buffer_1 = strftime(config_time_format, t);
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_time = (width * 9/20); // 1/2.2
    var fontsize_time_real = find_fontsize(fctx, fontsize_time, REM(15), buffer_1);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time_real / 2 - time_y_offset), font_main, config_color_time, fontsize_time_real, GTextAlignmentCenter);
    buffer_1 = strftime(config_info_below, t);
    buffer_1 = 
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    var fontsize_date = REM(28);
    var fontsize_date_real = find_fontsize(fctx, fontsize_date, REM(15), buffer_1);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, config_color_info_below_local, fontsize_date_real, GTextAlignmentCenter);
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
    if (progress_max == 0) progress_max = 1;
    var progress_height = REM(5);
    var progress_endx = width * progress_cur / progress_max;
    if (!progress_no) {
        draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx, progress_height)), config_color_progress_bar_local);
        draw_circle(fctx, FPoint(progress_endx, height_full), progress_height, config_color_progress_bar_local);
        if (progress_cur > progress_max) {
            var progress_endx2 = width * (progress_cur - progress_max) / progress_max;
            draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx2, progress_height)), config_color_progress_bar2);
            draw_circle(fctx, FPoint(progress_endx2, height_full), progress_height, config_color_progress_bar2);
        }
    }
    var w1 = config_widget_1;
    var w2 = config_widget_2;
    var w3 = config_widget_3;
    var w4 = config_widget_4;
    var w5 = config_widget_5;
    var w6 = config_widget_6;
    if (show_secondary_widgets && config_2nd_widgets) {
        w1 = config_widget_7;
        w2 = config_widget_8;
        w3 = config_widget_9;
        w4 = config_widget_10;
        w5 = config_widget_11;
        w6 = config_widget_12;
    }
    var widgets_margin_topbottom = REM(6); // gap between watch bounds and widgets
    var widgets_margin_leftright = REM(8);
    widgets[w1](fctx, true, FPoint(widgets_margin_leftright, widgets_margin_topbottom), GTextAlignmentLeft, config_color_widget_1, config_color_topbar_bg_local);
    widgets[w2](fctx, true, FPoint(width / 2, widgets_margin_topbottom), GTextAlignmentCenter, config_color_widget_2, config_color_topbar_bg_local);
    widgets[w3](fctx, true, FPoint(width - widgets_margin_leftright, widgets_margin_topbottom), GTextAlignmentRight, config_color_widget_3, config_color_topbar_bg_local);
    var compl_y = height_full - fontsize_widgets;
    var compl_y2 = compl_y - progress_height + REM(1);
    widgets[w4](fctx, true, FPoint(widgets_margin_leftright, progress_no ? compl_y : compl_y2), GTextAlignmentLeft, config_color_widget_4, config_color_background);
    widgets[w5](fctx, true, FPoint(width / 2, progress_no ? compl_y : compl_y2), GTextAlignmentCenter, config_color_widget_5, config_color_background);
    widgets[w6](fctx, true, FPoint(width - widgets_margin_leftright, progress_no ? compl_y : compl_y2), GTextAlignmentRight, config_color_widget_6, config_color_background);
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
            CONFIG_WEATHER_REFRESH: +30,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_WEATHER_REFRESH_FAILED: +30,
            CONFIG_COLOR_TOPBAR_BG: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_BELOW: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR2: +GColor.White,
            CONFIG_COLOR_TIME: +GColor.White,
            CONFIG_COLOR_PERC: +GColor.White,
            CONFIG_COLOR_WIDGET_1: +GColor.Black,
            CONFIG_COLOR_WIDGET_2: +GColor.Black,
            CONFIG_COLOR_WIDGET_3: +GColor.Black,
            CONFIG_COLOR_WIDGET_4: +GColor.White,
            CONFIG_COLOR_WIDGET_5: +GColor.White,
            CONFIG_COLOR_WIDGET_6: +GColor.White,
            CONFIG_COLOR_BACKGROUND: +GColor.Black,
            CONFIG_COLOR_DAY: +GColor.LightGray,
            CONFIG_COLOR_NIGHT: +GColor.Black,
            CONFIG_COLOR_BAT_30: +GColor.Yellow,
            CONFIG_COLOR_BAT_20: +GColor.ChromeYellow,
            CONFIG_COLOR_BAT_10: +GColor.Folly,
            CONFIG_LOWBAT_COL: +false,
            CONFIG_ADVANCED_APPEARANCE_LOCAL: +false,
            CONFIG_WIDGET_1: +4,
            CONFIG_WIDGET_2: +1,
            CONFIG_WIDGET_3: +5,
            CONFIG_WIDGET_4: +14,
            CONFIG_WIDGET_5: +6,
            CONFIG_WIDGET_6: +9,
            CONFIG_PROGRESS: +1,
            CONFIG_TIME_FORMAT: "%I:0%M",
            CONFIG_INFO_BELOW: "%A, %m/%d",
            CONFIG_UPDATE_SECOND: +0,
            CONFIG_ADVANCED_FORMAT_LOCAL: +false,
            CONFIG_TIME_FORMAT_LOCAL: +0,
            CONFIG_INFO_BELOW_LOCAL: +0,
            CONFIG_SHOW_DAYNIGHT: +true,
            CONFIG_STEP_GOAL: +10000,
            CONFIG_TZ_0_LOCAL: "America/Los_Angeles",
            CONFIG_TZ_1_LOCAL: "America/Los_Angeles",
            CONFIG_TZ_2_LOCAL: "America/Los_Angeles",
            CONFIG_TZ_0_FORMAT: "%I:0%M%P",
            CONFIG_TZ_1_FORMAT: "%I:0%M%P",
            CONFIG_TZ_2_FORMAT: "%I:0%M%P",
            CONFIG_HOURLY_VIBRATE: +false,
            CONFIG_SUNRISE_FORMAT: "%I:0%M",
            CONFIG_WIDGET_7: +38,
            CONFIG_WIDGET_8: +0,
            CONFIG_WIDGET_9: +42,
            CONFIG_WIDGET_10: +0,
            CONFIG_WIDGET_11: +0,
            CONFIG_WIDGET_12: +0,
            CONFIG_TIMEOUT_2ND_WIDGETS: +3000,
            CONFIG_2ND_WIDGETS: +true,
            CONFIG_WEATHER_SUNRISE_EXPIRATION: +48,
            CONFIG_COLOR_QUIET_MODE: +GColor.LavenderIndigo,
            CONFIG_QUIET_COL: +false,
            CONFIG_PHONE_BATTERY_EXPIRATION: +30,
            CONFIG_PHONE_BATTERY_REFRESH: +30,
            CONFIG_UPDATE_PHONEBAT_ON_SHAKE: +false,
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
            CONFIG_WEATHER_SOURCE_LOCAL: +3,
            CONFIG_WEATHER_APIKEY_LOCAL: "",
            CONFIG_WEATHER_LOCATION_LOCAL: "",
            CONFIG_WEATHER_REFRESH: +30,
            CONFIG_WEATHER_EXPIRATION: +3*60,
            CONFIG_WEATHER_REFRESH_FAILED: +30,
            CONFIG_COLOR_TOPBAR_BG: +GColor.VividCerulean,
            CONFIG_COLOR_INFO_BELOW: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR: +GColor.VividCerulean,
            CONFIG_COLOR_PROGRESS_BAR2: +GColor.White,
            CONFIG_COLOR_TIME: +GColor.White,
            CONFIG_COLOR_PERC: +GColor.White,
            CONFIG_COLOR_WIDGET_1: +GColor.Black,
            CONFIG_COLOR_WIDGET_2: +GColor.Black,
            CONFIG_COLOR_WIDGET_3: +GColor.Black,
            CONFIG_COLOR_WIDGET_4: +GColor.White,
            CONFIG_COLOR_WIDGET_5: +GColor.White,
            CONFIG_COLOR_WIDGET_6: +GColor.White,
            CONFIG_COLOR_BACKGROUND: +GColor.Black,
            CONFIG_COLOR_DAY: +GColor.LightGray,
            CONFIG_COLOR_NIGHT: +GColor.Black,
            CONFIG_COLOR_BAT_30: +GColor.Yellow,
            CONFIG_COLOR_BAT_20: +GColor.ChromeYellow,
            CONFIG_COLOR_BAT_10: +GColor.Folly,
            CONFIG_LOWBAT_COL: +true,
            CONFIG_ADVANCED_APPEARANCE_LOCAL: +false,
            CONFIG_WIDGET_1: +4,
            CONFIG_WIDGET_2: +1,
            CONFIG_WIDGET_3: +5,
            CONFIG_WIDGET_4: +34,
            CONFIG_WIDGET_5: +6,
            CONFIG_WIDGET_6: +9,
            CONFIG_PROGRESS: +1,
            CONFIG_TIME_FORMAT: "%I:0%M",
            CONFIG_INFO_BELOW: "%A, %m/%d",
            CONFIG_UPDATE_SECOND: +0,
            CONFIG_ADVANCED_FORMAT_LOCAL: +false,
            CONFIG_TIME_FORMAT_LOCAL: +0,
            CONFIG_INFO_BELOW_LOCAL: +0,
            CONFIG_SHOW_DAYNIGHT: +true,
            CONFIG_STEP_GOAL: +10000,
            CONFIG_TZ_0_LOCAL: "Europe/Zurich",
            CONFIG_TZ_1_LOCAL: "Asia/Shanghai",
            CONFIG_TZ_2_LOCAL: "Asia/Shanghai",
            CONFIG_TZ_0_FORMAT: "%I:0%M%Pmmm",
            CONFIG_TZ_1_FORMAT: "%I:0%M%Pmmm",
            CONFIG_TZ_2_FORMAT: "%I:0%M%Pmmm",
            CONFIG_HOURLY_VIBRATE: +false,
            CONFIG_SUNRISE_FORMAT: "%I:0%M%Pmmm",
            CONFIG_WIDGET_7: +38,
            CONFIG_WIDGET_8: +0,
            CONFIG_WIDGET_9: +42,
            CONFIG_WIDGET_10: +35,
            CONFIG_WIDGET_11: +0,
            CONFIG_WIDGET_12: +44,
            CONFIG_TIMEOUT_2ND_WIDGETS: +3000,
            CONFIG_2ND_WIDGETS: +true,
            CONFIG_WEATHER_SUNRISE_EXPIRATION: +48,
            CONFIG_COLOR_QUIET_MODE: +GColor.LavenderIndigo,
            CONFIG_QUIET_COL: +true,
            CONFIG_PHONE_BATTERY_EXPIRATION: +30,
            CONFIG_PHONE_BATTERY_REFRESH: +30,
            CONFIG_UPDATE_PHONEBAT_ON_SHAKE: +true,
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
        previewComplication: function (widget, config, canvasId, platform, state) {
            drawHelper(drawComplication, config, canvasId, platform, widget, state);
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
            res["CONFIG_COLOR_WIDGET_4"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_WIDGET_5"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_WIDGET_6"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
            res["CONFIG_COLOR_PROGRESS_BAR2"] = new_vals["SIMPLECONFIG_COLOR_MAIN"];
          }
          if ("SIMPLECONFIG_COLOR_ACCENT" in new_vals) {
            res["CONFIG_COLOR_TOPBAR_BG"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
            res["CONFIG_COLOR_INFO_BELOW"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
            res["CONFIG_COLOR_PROGRESS_BAR"] = new_vals["SIMPLECONFIG_COLOR_ACCENT"];
          }
          if ("SIMPLECONFIG_COLOR_BACKGROUND" in new_vals) {
            res["CONFIG_COLOR_BACKGROUND"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_WIDGET_1"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_WIDGET_2"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_WIDGET_3"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
            res["CONFIG_COLOR_NIGHT"] = new_vals["SIMPLECONFIG_COLOR_BACKGROUND"];
          }
// -- end autogen
          return override(new_vals, res);
        },
    }

}());

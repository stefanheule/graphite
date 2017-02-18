// Copyright 2016 Stefan Heule
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


#include "graphite.h"


////////////////////////////////////////////
//// Complication array
////////////////////////////////////////////

// -- jsalternative
// -- var widgets = [
widget_render_t widgets[] = {
// -- end jsalternative

// -- autogen
// -- ## for key in widgets
// --     {{ key["key"] | lower }}, // id {{ key["id"] }}
// -- ## endfor
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
    widget_tz_0, // id 32
// -- end autogen

// -- jsalternative
// -- ];
};
// -- end jsalternative


////////////////////////////////////////////
//// Complication render implementations
////////////////////////////////////////////

// -- autogen
// -- ## for i in range(num_tzs)
// -- fixed_t widget_tz_{{ i }}(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
// -- // -- jsalternative
// -- // -- return 0;
// --     int8_t dataidx = get_current_tz_idx(&tzinfo.data[{{ i }}]);
// --     time_t adjusted = time(NULL) - tzinfo.data[{{ i }}].offsets[dataidx] * 60;
// --     struct tm* t = gmtime(&adjusted);
// --     strftime(buffer_1, sizeof(buffer_1), "%H:%M", t);
// --     if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
// --     return string_width(fctx, buffer_1, font_main, fontsize_widgets);
// -- // -- end jsalternative
// -- }
// -- ## endfor
fixed_t widget_tz_0(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
// -- jsalternative
// -- return 0;
    int8_t dataidx = get_current_tz_idx(&tzinfo.data[0]);
    time_t adjusted = time(NULL) - tzinfo.data[0].offsets[dataidx] * 60;
    struct tm* t = gmtime(&adjusted);
    strftime(buffer_1, sizeof(buffer_1), "%H:%M", t);
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
// -- end jsalternative
}
// -- end autogen

typedef char* (*num_formater_t)(int num, void* data);

fixed_t draw_icon_number_widget(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color, const char* icon, const char* text, bool show_icon) {
  fixed_t fontsize_icon = (fixed_t)(fontsize_widgets * 0.62);
  fixed_t w1 = !show_icon ? 0 : string_width(fctx, icon, font_icon, fontsize_icon);
  fixed_t w2 = string_width(fctx, text, font_main, fontsize_widgets);
  fixed_t sep = REM(2);
  fixed_t w = w1 + w2 + sep;
  GTextAlignment a = GTextAlignmentLeft;
  uint8_t color = foreground_color;

  if (draw) {
      fixed_t icon_y = position.y + fontsize_icon*0.4;
      if (align == GTextAlignmentCenter) {
          if (w1) draw_string(fctx, icon, FPoint(position.x - w/2, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize_widgets, a);
      } else if (align == GTextAlignmentLeft) {
          if (w1) draw_string(fctx, icon, FPoint(position.x, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize_widgets, a);
      } else {
          if (w1) draw_string(fctx, icon, FPoint(position.x - w, icon_y), font_icon, color, fontsize_icon, a);
          draw_string(fctx, text, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize_widgets, a);
      }
  }

  return w;
}

char* format_unitless(int num) {
  snprintf(buffer_1, 10, "%d", num);
  return buffer_1;
}

char* format_thousands(int num) {
  if (num < 1000) {
    return format_unitless(num);
  }
  if (num < 10000) {
    int thousands = num/1000;
    int rest = (num % 1000) / 100;
    if (rest == 0) {
      snprintf(buffer_1, 10, "%dk", thousands);
    } else {
      snprintf(buffer_1, 10, "%d.%dk", thousands, rest);
    }
  } else {
    snprintf(buffer_1, 10, "%dk", num/1000);
  }
  return buffer_1;
}

fixed_t widget_empty(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return 0;
}

fixed_t widget_battery_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {

  // battery logo (not scaled, to allow pixel-aligned rects)
  fixed_t bat_thickness = PIX(1);
  fixed_t bat_gap_thickness = PIX(1);
  fixed_t bat_height = PIX(15);
  fixed_t bat_width = PIX(9);
  fixed_t bat_top = PIX(2);
  fixed_t bat_inner_height = bat_height - 2 * bat_thickness - 2 * bat_gap_thickness;
  fixed_t bat_inner_width = bat_width - 2 * bat_thickness - 2 * bat_gap_thickness;

  if (!draw) return bat_width;

  fixed_t offset = 0;
  if (align == GTextAlignmentCenter) offset = bat_width / 2;
  if (align == GTextAlignmentRight) offset = bat_width;
  BatteryChargeState battery_state = battery_state_service_peek();
  FPoint bat_origin = FPoint(FIXED_ROUND(position.x - offset), FIXED_ROUND(position.y + (REM(21)-bat_height)/2));
  // outer rect
  draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), foreground_color);
  // inner background rect
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), background_color);
  // inner charge rect
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - battery_state.charge_percent) * bat_inner_height / 100), FSize(
          bat_inner_width, battery_state.charge_percent * bat_inner_height / 100)), foreground_color);
  // top of battery
  draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), foreground_color);
  return bat_width;
}

fixed_t widget_bluetooth_disconly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "H", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "H", font_icon, fontsize_widgets);
  }
  return 0;
}

fixed_t widget_bluetooth_disconly_alt(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "I", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "I", font_icon, fontsize_widgets);
  }
  return 0;
}

fixed_t widget_bluetooth_yesno(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  fixed_t fontsize_bt_icon = REM(25);
  char* icon = "DH";
  if (!bluetooth_connection_service_peek()) {
    icon = "BH";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}

fixed_t widget_quiet_offonly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (quiet_time_is_active()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "F", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "F", font_icon, fontsize_bt_icon);
  }
  return 0;
}

fixed_t widget_quiet(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  fixed_t fontsize_bt_icon = REM(25);
  char* icon = "G";
  if (quiet_time_is_active()) {
    icon = "F";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}

fixed_t widget_ampm(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  strftime(buffer_1, sizeof(buffer_1), "%p", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}

fixed_t widget_ampm_lower(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  strftime(buffer_1, sizeof(buffer_1), "%P", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}

fixed_t widget_seconds(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  strftime(buffer_1, sizeof(buffer_1), "%S", t);
// -- jsalternative
// --   buffer_1 = 
// -- end jsalternative
  remove_leading_zero(buffer_1, sizeof(buffer_1));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}

fixed_t widget_day_of_week(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  strftime(buffer_1, sizeof(buffer_1), "%a", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
  return string_width(fctx, buffer_1, font_main, fontsize_widgets);
}

fixed_t widget_weather_cur_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.temp_cur == GRAPHITE_UNKNOWN_WEATHER) return 0;
    if (weather.failed) {
      snprintf(buffer_2, 10, "%d", weather.temp_cur);
    } else {
      snprintf(buffer_2, 10, "%d°", weather.temp_cur);
    }
    if (draw) draw_string(fctx, buffer_2, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_2, font_main, fontsize_widgets);
  }
  return 0;
}

fixed_t widget_weather_cur_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.temp_cur == GRAPHITE_UNKNOWN_WEATHER) return 0;
    snprintf(buffer_1, 10, "%c", weather.icon);
// -- jsalternative
// -- buffer_2 = "";
      buffer_2[0] = 0;
// -- end jsalternative
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_widgets, align);
  }
  return 0;
}

fixed_t widget_weather_cur_temp_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.temp_cur == GRAPHITE_UNKNOWN_WEATHER) return 0;
    snprintf(buffer_1, 10, "%c", weather.icon);
    if (weather.failed) {
        snprintf(buffer_2, 10, "%d", weather.temp_cur);
    } else {
        snprintf(buffer_2, 10, "%d°", weather.temp_cur);
    }
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_widgets, align);
  }
  return 0;
}

fixed_t widget_weather_low_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.temp_low == GRAPHITE_UNKNOWN_WEATHER) return 0;
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_low);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_low);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
  }
  return 0;
}

fixed_t widget_weather_high_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.temp_high == GRAPHITE_UNKNOWN_WEATHER) return 0;
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_high);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_high);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_widgets, align);
    return string_width(fctx, buffer_1, font_main, fontsize_widgets);
  }
  return 0;
}




// -- autogen
// -- ## for key in widgets
// -- ## if key["autogen"] == "icon_text"
// -- fixed_t {{ key["key"] | lower }}(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
// --   return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "{{ key["icontext"] }}", {{ key["text"] }}, {{ key["icon"] }});
// -- }
// -- ## endif
// -- 
// -- 
// -- ## endfor
fixed_t widget_steps_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), true);
}
fixed_t widget_steps(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), false);
}
fixed_t widget_steps_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), true);
}
fixed_t widget_steps_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), false);
}
fixed_t widget_calories_resting_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), true);
}
fixed_t widget_calories_resting(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)), false);
}
fixed_t widget_calories_active_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), true);
}
fixed_t widget_calories_active(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricActiveKCalories)), false);
}
fixed_t widget_calories_all_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true);
}
fixed_t widget_calories_all(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_unitless(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false);
}
fixed_t widget_calories_resting_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), true);
}
fixed_t widget_calories_resting_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)), false);
}
fixed_t widget_calories_active_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), true);
}
fixed_t widget_calories_active_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricActiveKCalories)), false);
}
fixed_t widget_calories_all_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), true);
}
fixed_t widget_calories_all_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_widget(fctx, draw, position, align, foreground_color, background_color, "K", format_thousands(health_service_sum_today(HealthMetricRestingKCalories)+health_service_sum_today(HealthMetricActiveKCalories)), false);
}
// -- end autogen

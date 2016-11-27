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


#include "redshift.h"


////////////////////////////////////////////
//// Complication array
////////////////////////////////////////////

// -- jsalternative
// -- var complications = [
complication_render_t complications[] = {
// -- end jsalternative

// -- autogen
// -- ## for key in complications
// --     {{ key["key"] | lower }}, // id {{ key["id"] }}
// -- ## endfor
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
    complication_ampm, // id 16
    complication_ampm_lower, // id 17
    complication_seconds, // id 18
// -- end autogen

// -- jsalternative
// -- ];
};
// -- end jsalternative


////////////////////////////////////////////
//// Complication render implementations
////////////////////////////////////////////

typedef char* (*num_formater_t)(int num, void* data);

fixed_t draw_icon_number_complication(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color, const char* icon, const char* text, bool show_icon) {
  fixed_t fontsize_icon = (fixed_t)(fontsize_complications * 0.62);
  fixed_t w1 = !show_icon ? 0 : string_width(fctx, icon, font_icon, fontsize_icon);
  fixed_t w2 = string_width(fctx, text, font_main, fontsize_complications);
  fixed_t sep = REM(2);
  fixed_t w = w1 + w2 + sep;
  GTextAlignment a = GTextAlignmentLeft;
  uint8_t color = foreground_color;

  if (draw) {
      fixed_t icon_y = position.y + fontsize_icon*0.8;
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

fixed_t complication_empty(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return 0;
}

fixed_t complication_battery_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {

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

fixed_t complication_bluetooth_disconly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "H", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "H", font_icon, fontsize_complications);
  }
  return 0;
}

fixed_t complication_bluetooth_disconly_alt(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "I", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "I", font_icon, fontsize_complications);
  }
  return 0;
}

fixed_t complication_bluetooth_yesno(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  fixed_t fontsize_bt_icon = REM(25);
  char* icon = "DH";
  if (!bluetooth_connection_service_peek()) {
    icon = "BH";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}

fixed_t complication_quiet_offonly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (quiet_time_is_active()) {
    fixed_t fontsize_bt_icon = REM(25);
    if (draw) draw_string(fctx, "F", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "F", font_icon, fontsize_bt_icon);
  }
  return 0;
}

fixed_t complication_quiet(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  fixed_t fontsize_bt_icon = REM(25);
  char* icon = "G";
  if (quiet_time_is_active()) {
    icon = "F";
  }
  if (draw) draw_string(fctx, icon, FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
  return string_width(fctx, icon, font_icon, fontsize_bt_icon);
}

fixed_t complication_ampm(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  setlocale(LC_ALL, "");
  strftime(buffer_1, sizeof(buffer_1), "%p", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}

fixed_t complication_ampm_lower(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  setlocale(LC_ALL, "");
  strftime(buffer_1, sizeof(buffer_1), "%P", t);
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}

fixed_t complication_seconds(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  time_t now = time(NULL);
    struct tm *t = localtime(&now);
  setlocale(LC_ALL, "");
  strftime(buffer_1, sizeof(buffer_1), "%S", t);
// -- jsalternative
// --   buffer_1 = 
// -- end jsalternative
  remove_leading_zero(buffer_1, sizeof(buffer_1));
  if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  return string_width(fctx, buffer_1, font_main, fontsize_complications);
}

fixed_t complication_weather_cur_temp_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    snprintf(buffer_1, 10, "%c", weather.icon);
    if (weather.failed) {
        snprintf(buffer_2, 10, "%d", weather.temp_cur);
    } else {
        snprintf(buffer_2, 10, "%d°", weather.temp_cur);
    }
    return draw_weather(fctx, draw, buffer_1, buffer_2, position, foreground_color, fontsize_complications, align);
  }
  return 0;
}

fixed_t complication_weather_low_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_low);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_low);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
    return string_width(fctx, buffer_1, font_main, fontsize_complications);
  }
  return 0;
}

fixed_t complication_weather_high_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_high);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_high);
    }
    if (draw) draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
    return string_width(fctx, buffer_1, font_main, fontsize_complications);
  }
  return 0;
}




// -- autogen
// -- ## for key in complications
// -- ## if key["autogen"] == "icon_text"
// -- fixed_t {{ key["key"] | lower }}(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
// --   return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "{{ key["icontext"] }}", {{ key["text"] }}, {{ key["icon"] }});
// -- }
// -- ## endif
// -- 
// -- 
// -- ## endfor
fixed_t complication_heartrate_cur_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "J", format_unitless((int)health_service_peek_current_value(HealthMetricHeartRateBPM)), true);
}
fixed_t complication_heartrate_cur(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "J", format_unitless((int)health_service_peek_current_value(HealthMetricHeartRateBPM)), false);
}
fixed_t complication_steps_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), true);
}
fixed_t complication_steps(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_unitless(health_service_sum_today(HealthMetricStepCount)), false);
}
fixed_t complication_steps_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), true);
}
fixed_t complication_steps_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return draw_icon_number_complication(fctx, draw, position, align, foreground_color, background_color, "A", format_thousands(health_service_sum_today(HealthMetricStepCount)), false);
}
// -- end autogen

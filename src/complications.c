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
    complication_heartrate_cur, // id 5
    complication_battery_icon, // id 6
// -- end autogen

// -- jsalternative
// -- ];
};
// -- end jsalternative


////////////////////////////////////////////
//// Complication render implementations
////////////////////////////////////////////

fixed_t complication_empty(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  return 0;
}

fixed_t complication_heartrate_cur(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  HealthValue hr = health_service_peek_current_value(HealthMetricHeartRateBPM);
  if (hr != 0) {
  //    HealthValue resthr = health_service_peek_current_value(HealthMetricRestingHeartRateBPM);
      // snprintf(buffer_1, 10, "%i", (int)hr);
      // draw_string(fctx, "1", FPoint(complications_margin_leftright, height_full - REM(13)), font_icon, config_color_bottom_complications, REM(15), GTextAlignmentLeft);
      // draw_string(fctx, buffer_1, FPoint(complications_margin_leftright + REM(16), height_full - REM(26)), font_main, config_color_bottom_complications, fontsize_complications, GTextAlignmentLeft);
  }
  return 0;
}

fixed_t complication_battery_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  // battery logo (not scaled, to allow pixel-aligned rects)
  // fixed_t bat_thickness = PIX(1);
  // fixed_t bat_gap_thickness = PIX(1);
  // fixed_t bat_height = PIX(15);
  // fixed_t bat_width = PIX(9);
  // fixed_t bat_sep = PIX(3);
  // fixed_t bat_top = PIX(2);
  // fixed_t bat_inner_height = bat_height - 2 * bat_thickness - 2 * bat_gap_thickness;
  // fixed_t bat_inner_width = bat_width - 2 * bat_thickness - 2 * bat_gap_thickness;
  // bool bat_avoid_stepbar = width - (width * steps / steps_goal + pos_stepbar_height) < 2*bat_sep + bat_width;
  // FPoint bat_origin = FPoint(width - bat_sep - bat_width, height_full - bat_sep - bat_height - (bat_avoid_stepbar ? pos_stepbar_height : 0));
  // // outer rect
  // draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), config_color_bottom_complications);
  // // inner background rect
  // draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), config_color_background);
  // // inner charge rect
  // draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - battery_state.charge_percent) * bat_inner_height / 100), FSize(
  //         bat_inner_width, battery_state.charge_percent * bat_inner_height / 100)), config_color_bottom_complications);
  // // top of battery
  // draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), config_color_bottom_complications);
  return 0;
}

fixed_t complication_bluetooth_disconly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    fixed_t fontsize_bt_icon = REM(23);
    if (draw) draw_string(fctx, "2", FPoint(position.x, position.y + REM(11)), font_icon, foreground_color, fontsize_bt_icon, align);
    return string_width(fctx, "2", font_icon, fontsize_complications);
  }
  return 0;
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

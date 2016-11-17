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

typedef void (*complication_render_t)(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);

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
// -- end autogen

// -- jsalternative
// -- ];
};
// -- end jsalternative


////////////////////////////////////////////
//// Complication render implementations
////////////////////////////////////////////

void complication_empty(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
}

void complication_bluetooth_disconly(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (!bluetooth_connection_service_peek()) {
    draw_string(fctx, "2", position, font_icon, foreground_color, REM(20), align);
  }
}

void complication_weather_cur_temp_icon(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    snprintf(buffer_1, 10, "%c", weather.icon);
    if (weather.failed) {
        snprintf(buffer_2, 10, "%d", weather.temp_cur);
    } else {
        snprintf(buffer_2, 10, "%d°", weather.temp_cur);
    }
    draw_weather(fctx, buffer_1, buffer_2, position, foreground_color, fontsize_complications, align);
  }
}

void complication_weather_low_temp(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_low);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_low);
    }
    draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  }
}

void complication_weather_high_temp(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color) {
  if (show_weather()) {
    if (weather.failed) {
        snprintf(buffer_1, 10, "%d", weather.temp_high);
    } else {
        snprintf(buffer_1, 10, "%d°", weather.temp_high);
    }
    draw_string(fctx, buffer_1, position, font_main, foreground_color, fontsize_complications, align);
  }
}

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

#ifndef GRAPHITE_WIDGETS_H
#define GRAPHITE_WIDGETS_H

#include "graphite.h"

// -- autogen
// -- ## for key in widgets
// -- fixed_t {{ key["key"] | lower }}(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
// -- ## endfor
fixed_t widget_empty(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_weather_cur_temp_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_weather_cur_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_weather_cur_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_weather_low_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_weather_high_temp(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_bluetooth_disconly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_bluetooth_disconly_alt(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_bluetooth_yesno(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_battery_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_battery_text(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_battery_text2(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_quiet_offonly(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_quiet(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_0(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_ampm(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_ampm_lower(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_seconds(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_day_of_week(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_steps_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_steps(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_steps_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_steps_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_resting_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_resting(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_active_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_active(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_all_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_all(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_resting_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_resting_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_active_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_active_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_all_short_icon(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_calories_all_short(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_1(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_2(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_3(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_4(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
fixed_t widget_tz_5(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
// -- end autogen


#endif //GRAPHITE_WIDGETS_H

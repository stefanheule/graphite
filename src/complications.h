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

#ifndef REDSHIFT_COMPLICATIONS_H
#define REDSHIFT_COMPLICATIONS_H

#include "redshift.h"

// -- autogen
// -- ## for key in complications
// -- void {{ key["key"] | lower }}(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
// -- ## endfor
void complication_empty(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
void complication_weather_cur_temp_icon(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
void complication_weather_low_temp(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
void complication_weather_high_temp(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
void complication_bluetooth_disconly(FContext* fctx, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
// -- end autogen


#endif //REDSHIFT_COMPLICATIONS_H

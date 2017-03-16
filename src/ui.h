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

#ifndef GRAPHITE_DRAWING_H
#define GRAPHITE_DRAWING_H

#include "graphite.h"

void bluetooth_popup(FContext* fctx, GContext *ctx, bool connected);
void background_update_proc(Layer *layer, GContext *ctx);
bool show_weather();
fixed_t draw_weather(FContext* fctx, bool draw, const char* icon, const char* temp, FPoint position, uint8_t color, fixed_t fontsize, GTextAlignment align, bool flip_order);
void remove_leading_zero(char *buffer, size_t length);

#endif //GRAPHITE_DRAWING_H

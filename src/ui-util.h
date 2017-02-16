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

#ifndef GRAPHITE_FCTX_H
#define GRAPHITE_FCTX_H

#include "graphite.h"

#define FRect(origin, size) ((FRect){(origin), (size)})
#define FSize(w, h) ((FSize){(w), (h)})

static inline FRect g2frect(GRect grect) {
    return FRect(g2fpoint(grect.origin), FSize(INT_TO_FIXED(grect.size.w), INT_TO_FIXED(grect.size.h)));
}

static inline FRect g2frect(GRect grect);
void draw_string(FContext *fctx, const char *str, FPoint position, FFont *font, uint8_t color, fixed_t size, GTextAlignment align);
fixed_t string_width(FContext *fctx, const char *str, FFont *font, int size);
void draw_rect(FContext *fctx, FRect rect, uint8_t color);
void draw_circle(FContext *fctx, FPoint center, fixed_t r, uint8_t color);

#endif //GRAPHITE_FCTX_H

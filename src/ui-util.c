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

#include "ui-util.h"
#include "graphite.h"

/**
 * Draw a string with a given font, color, size and position.
 */
void draw_string(FContext *fctx, const char *str, FPoint position, FFont *font, uint8_t color, fixed_t size, GTextAlignment align) {
    fctx_begin_fill(fctx);
    fctx_set_fill_color(fctx, COLOR(color));
    fctx_set_color_bias(fctx, 0);
    fctx_set_pivot(fctx, FPointZero);
    fctx_set_offset(fctx, position);
    fctx_set_rotation(fctx, 0);
    fctx_set_text_em_height(fctx, font, FIXED_TO_INT(size));
    fctx_draw_string(fctx, str, font, align, FTextAnchorCapTop);
    fctx_end_fill(fctx);
}

/**
 * Measure the width of a string in a particular font.
 */
fixed_t string_width(FContext *fctx, const char *str, FFont *font, int size) {
    if (str[0] == 0) return 0;
    fctx_set_text_em_height(fctx, font, FIXED_TO_INT(size));
    return fctx_string_width(fctx, str, font);
}

/**
 * Draw a filled rectangle.
 */
void draw_rect(FContext *fctx, FRect rect, uint8_t color) {
    fctx_begin_fill(fctx);
    fctx_set_fill_color(fctx, COLOR(color));
    fctx_set_color_bias(fctx, 0);
    fctx_set_pivot(fctx, FPointZero);
    fctx_set_offset(fctx, FPointZero);
    fctx_set_scale(fctx, FPointOne, FPointOne);
    fctx_set_rotation(fctx, 0);
    fctx_move_to(fctx, rect.origin);
    fctx_line_to(fctx, FPoint(rect.origin.x + rect.size.w, rect.origin.y));
    fctx_line_to(fctx, FPoint(rect.origin.x + rect.size.w, rect.origin.y + rect.size.h));
    fctx_line_to(fctx, FPoint(rect.origin.x, rect.origin.y + rect.size.h));
    fctx_close_path(fctx);
    fctx_end_fill(fctx);
}

/**
 * Draw a filled circle.
 */
void draw_circle(FContext *fctx, FPoint center, fixed_t r, uint8_t color) {
    fctx_begin_fill(fctx);
    fctx_set_fill_color(fctx, COLOR(color));
    fctx_set_color_bias(fctx, 0);
    fctx_set_pivot(fctx, FPointZero);
    fctx_set_offset(fctx, FPointZero);
    fctx_set_scale(fctx, FPointOne, FPointOne);
    fctx_set_rotation(fctx, 0);
    fctx_plot_circle(fctx, &center, r);
    fctx_end_fill(fctx);
}
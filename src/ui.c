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

#include "ui.h"
#include "redshift.h"


/**
 * Is something obstructing our layer?
 */
bool is_obstructed() {
    Layer *layer = layer_background;
    GRect full = layer_get_bounds(layer);
    GRect partial = layer_get_unobstructed_bounds(layer);

    return full.size.h != partial.size.h || full.size.w != partial.size.w;
}

/**
 * Draws a popup about the bluetooth connection
 */
void bluetooth_popup(FContext* fctx, GContext *ctx, bool connected) {
#ifndef DEBUG_BLUETOOTH_POPUP
    if (!show_bluetooth_popup) return;
#endif

    // int16_t yoffset = PBL_IF_ROUND_ELSE(70, 50);
    // graphics_context_set_fill_color(ctx, GColorBlack);
    // GRect notification_rect = GRect(-10, height - yoffset - 7, width + 20, 50);
    // graphics_fill_rect(ctx, notification_rect, 0, GCornersAll);
    // graphics_context_set_fill_color(ctx, GColorWhite);
    // graphics_fill_rect(ctx, GRect(-10, height - yoffset - 3, width + 20, 50 - 8), 0, GCornersAll);
    // char *str1 = "Bluetooth";
    // char *str2 = connected ? "Connected" : "Disconnected";
    // GPoint pos = GPoint((width - 24) / 2 - width/2, notification_rect.origin.y + 4);
    // draw_string(fctx, str1, pos, font_main, GColorBlack, 18, true);
    // draw_string(fctx, str2, GPoint(pos.x, pos.y + 20), font_main, GColorBlack, 18, true);
    // if (connected) {
    //     graphics_context_set_fill_color(ctx, COLOR_FALLBACK(GColorGreen, GColorBlack));
    // } else {
    //     graphics_context_set_fill_color(ctx, COLOR_FALLBACK(GColorRed, GColorBlack));
    // }

    // GPoint icon_center = GPoint(PBL_IF_ROUND_ELSE(135, width - 24) + 3,
    //                             notification_rect.origin.y + notification_rect.size.h - 26);
    // graphics_fill_circle(ctx, icon_center, 9);
    // graphics_context_set_stroke_color(ctx, GColorWhite);

    // if (connected) {
    //     graphics_draw_line_with_width(ctx,
    //                                   GPoint(icon_center.x + 4, icon_center.y - 3),
    //                                   GPoint(icon_center.x - 2, icon_center.y + 3), 2);
    //     graphics_draw_line_with_width(ctx,
    //                                   GPoint(icon_center.x - 4, icon_center.y + 0),
    //                                   GPoint(icon_center.x - 2, icon_center.y + 3), 2);
    // } else {
    //     graphics_draw_line_with_width(ctx,
    //                                   GPoint(icon_center.x + 3, icon_center.y - 3),
    //                                   GPoint(icon_center.x - 3, icon_center.y + 3), 2);
    //     graphics_draw_line_with_width(ctx,
    //                                   GPoint(icon_center.x - 3, icon_center.y - 3),
    //                                   GPoint(icon_center.x + 3, icon_center.y + 3), 2);
    // }
}

/**
 * Remove all leading zeros in a string.
 */
void remove_leading_zero(char *buffer, size_t length) {
    bool last_was_space = true;
    int i = 0;
    while (buffer[i] != 0) {
        if (buffer[i] == '0' && last_was_space) {
            memcpy(&buffer[i], &buffer[i + 1], length - (i + 1));
        }
        last_was_space = buffer[i] == ' ' || buffer[i] == '.' || buffer[i] == '/';
        i += 1;
    }
}

void draw_weather(FContext* fctx, const char* icon, const char* temp, FPoint position, GColor color, fixed_t fontsize, GTextAlignment align) {
    fixed_t weather_fontsize = (fixed_t)(fontsize * 1.15);
    fixed_t w1 = string_width(fctx, icon, font_weather, weather_fontsize);
    fixed_t w2 = string_width(fctx, temp, font_main, fontsize);
    fixed_t sep = REM(2);
    fixed_t w = w1 + w2 + sep;
    GTextAlignment a = GTextAlignmentLeft;

    if (align == GTextAlignmentCenter) {
        draw_string(fctx, icon, FPoint(position.x - w/2, position.y + weather_fontsize/8), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize, a);
    } else if (align == GTextAlignmentLeft) {
        draw_string(fctx, icon, FPoint(position.x, position.y + weather_fontsize/2), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize, a);
    } else {
        draw_string(fctx, icon, FPoint(position.x - w, position.y + weather_fontsize/2), font_weather, color, weather_fontsize, a);
        draw_string(fctx, temp, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize, a);
    }
}

/**
 * Draw the watch face.
 */
void background_update_proc(Layer *layer, GContext *ctx) {

    // initialize fctx
    FContext fctx_obj;
    FContext* fctx = &fctx_obj;
    fctx_init_context(fctx, ctx);

//    APP_LOG(APP_LOG_LEVEL_DEBUG, "drawing...");

    // update bounds
    FRect bounds = g2frect(layer_get_unobstructed_bounds(layer_background));
    height = bounds.size.h;
    width = bounds.size.w;

    // get current time
    time_t now = time(NULL);
    struct tm *t = localtime(&now);

    setlocale(LC_ALL, "");
    strftime(buffer_1, sizeof(buffer_1), "%H:%M", t);
    strftime(buffer_2, sizeof(buffer_1), "%A, %m/%d", t);
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    remove_leading_zero(buffer_2, sizeof(buffer_1));

    // background
    GColor color_accent = GColorDarkCandyAppleRed;
    GColor color_background = GColorWhite;
    draw_rect(fctx, bounds, color_background);

    // top bar
    draw_rect(fctx, FRect(bounds.origin, FSize(width, REM(30))), color_accent);
    fixed_t fontsize_weather = REM(25);
    fixed_t pos_weather_y = REM(5);
    draw_weather(fctx, "a", "21°", FPoint(width/2, pos_weather_y), color_background, fontsize_weather, GTextAlignmentCenter);
    draw_string(fctx, "9°", FPoint(pos_weather_y, pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentLeft);
    draw_string(fctx, "28°", FPoint(width - pos_weather_y, pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentRight);

    // time
    fixed_t fontsize_time = (fixed_t)(width / 2.2);
    draw_string(fctx, buffer_1, FPoint(width / 2, height / 2 - fontsize_time / 2), font_main, GColorBlack, fontsize_time, GTextAlignmentCenter);

    // date
    fixed_t fontsize_date = (fixed_t)(width / 8);
    draw_string(fctx, buffer_2, FPoint(width / 2, height / 2 + fontsize_time / 3), font_main, color_accent, fontsize_date, GTextAlignmentCenter);

    // step bar
    int steps = 2300;
    int steps_goal = 10000;
    fixed_t pos_stepbar_height = REM(4);
    fixed_t pos_stepbar_endx = width * steps / steps_goal;
    draw_rect(fctx, FRect(FPoint(0, height - pos_stepbar_height), FSize(pos_stepbar_endx, pos_stepbar_height)), color_accent);
    draw_circle(fctx, FPoint(pos_stepbar_endx, height), pos_stepbar_height, color_accent);

    // heart rate
    fixed_t fontsize_hr = REM(25);
    draw_string(fctx, "1", FPoint(pos_weather_y, height - REM(13)), font_icon, GColorBlack, REM(15), GTextAlignmentLeft);
    draw_string(fctx, "68/54", FPoint(pos_weather_y + REM(16), height - REM(26)), font_main, GColorBlack,fontsize_hr, GTextAlignmentLeft);

    bool bluetooth = bluetooth_connection_service_peek();
    // BatteryChargeState battery_state = battery_state_service_peek();

    // draw the bluetooth popup
    bluetooth_popup(fctx, ctx, bluetooth);

    // end fctx
    fctx_deinit_context(fctx);
}


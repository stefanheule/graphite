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

#include <pebble.h>
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
    FRect bounds_full = g2frect(layer_get_bounds(layer_background));
    height_full = bounds_full.size.h;
    width_full = bounds_full.size.w;

    // get current time
    time_t now = time(NULL);
    struct tm *t = localtime(&now);

    // config
//    GColor color_accent = GColorDarkCandyAppleRed;
//    GColor color_background = GColorWhite;
//    GColor color_main = GColorBlack;
//    GColor color_battery = GColorDarkGray;
    GColor color_accent = GColorVividCerulean;
    GColor color_accent2 = GColorBlue;
    GColor color_background = GColorBlack;
    GColor color_main = GColorWhite;
    GColor color_main2 = GColorLightGray;
    GColor color_battery = GColorLightGray;

    // background
    draw_rect(fctx, bounds_full, color_background);

    // top bar
    fixed_t fontsize_weather = REM(27);
    fixed_t topbar_height = fontsize_weather + REM(4);
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), color_accent);
    fixed_t pos_weather_y = REM(5);
    bool weather_is_on = config_weather_refresh > 0;
    bool weather_is_available = weather.timestamp > 0;
    bool weather_is_outdated = (time(NULL) - weather.timestamp) > (config_weather_expiration * 60);
    bool show_weather = weather_is_on && weather_is_available && !weather_is_outdated;
    if (show_weather) {
        if (weather.failed) {
            snprintf(buffer_1, 10, "%c", weather.icon);
            snprintf(buffer_2, 10, "%d", weather.temperature);
        } else {
            snprintf(buffer_1, 10, "%c", weather.icon);
            snprintf(buffer_2, 10, "%d°", weather.temperature);
        }
        draw_weather(fctx, buffer_1, buffer_2, FPoint(width/2, pos_weather_y), color_background, fontsize_weather, GTextAlignmentCenter);
        draw_string(fctx, "9°", FPoint(pos_weather_y + REM(2), pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentLeft);
        draw_string(fctx, "28°", FPoint(width - pos_weather_y, pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentRight);
    }

    // rain preview
    uint8_t percipProb[] = {
            63, 63, 63, 62, 62, 66, 70, 62, 66, 63, 62, 65, 59, 69, 73, 72, 70, 69, 67, 64, 56, 16, 0, 04, 15, 21, 28, 32, 30, 23, 18, 17, 17, 18, 19, 21, 21, 16, 10, 05, 03, 01, 0, 0, 0, 03, 13, 29, 42
    };
    fixed_t prec_t_h = REM(3);
    int nHours = 24;
    fixed_t perc_sep = REM(2);
    fixed_t perc_w = (width - (nHours + 1) * perc_sep) / nHours;
    fixed_t perc_maxheight = REM(20);
    for (int i = 0; i < nHours; i++) {
        bool h6 = (i-3) % 6 == 0;
        h6 = false; // TODO
        FRect rect = FRect(FPoint(perc_sep + i * (perc_sep + perc_w), topbar_height + prec_t_h), FSize(perc_w, perc_maxheight * percipProb[(nHours <= 24 ? 10 : 0)+i] / 100));
        draw_rect(fctx, rect, h6 ? color_main2 : color_main);
        if (h6) {
            fixed_t perc_h6_w = REM(2);
            draw_rect(fctx, FRect(FPoint(rect.origin.x + perc_w/2 - perc_h6_w/2, rect.origin.y), FSize(perc_h6_w, perc_maxheight)), color_main2);
        }
    }
    // rain preview time indicator
    fixed_t prec_t_w = width / (nHours / 6);
    for (int i = 0; i < nHours / 6; i++) {
        FRect rect = FRect(FPoint(i * prec_t_w, topbar_height), FSize(prec_t_w, prec_t_h));
        draw_rect(fctx, rect, i % 2 == 0 ? color_accent : color_accent2);
    }

    // time
    setlocale(LC_ALL, "");
    strftime(buffer_1, sizeof(buffer_1), "%I:%M", t);
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    fixed_t fontsize_time = (fixed_t)(width / 2.2);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time / 2), font_main, color_main, fontsize_time, GTextAlignmentCenter);

    // date
    strftime(buffer_1, sizeof(buffer_1), "%A, %m/%d", t);
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    fixed_t fontsize_date = (fixed_t)(width / 8);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3), font_main, color_accent, fontsize_date, GTextAlignmentCenter);

    // step bar
    int steps = health_service_sum_today(HealthMetricStepCount);
    int steps_goal = 10000;
    fixed_t pos_stepbar_height = REM(5);
    fixed_t pos_stepbar_endx = width * steps / steps_goal;
    draw_rect(fctx, FRect(FPoint(0, height_full - pos_stepbar_height), FSize(pos_stepbar_endx, pos_stepbar_height)), color_accent);
    draw_circle(fctx, FPoint(pos_stepbar_endx, height_full), pos_stepbar_height, color_accent);

    // heart rate
    fixed_t fontsize_hr = REM(25);
    draw_string(fctx, "1", FPoint(pos_weather_y, height_full - REM(13)), font_icon, color_main, REM(15), GTextAlignmentLeft);
    draw_string(fctx, "68/54", FPoint(pos_weather_y + REM(16), height_full - REM(26)), font_main, color_main,fontsize_hr, GTextAlignmentLeft);

    // battery logo (not scaled, to allow pixel-aligned rects)
    BatteryChargeState battery_state = battery_state_service_peek();
    fixed_t bat_thickness = PIX(2);
    fixed_t bat_height = PIX(18);
    fixed_t bat_width = PIX(12);
    fixed_t bat_sep = PIX(3);
    bool bat_avoid_stepbar = width - (width * steps / steps_goal + pos_stepbar_height) < 2*bat_sep + bat_width;
    FPoint bat_origin = FPoint(width - bat_sep - bat_width, height_full - bat_sep - bat_height - (bat_avoid_stepbar ? pos_stepbar_height : 0));
    draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), color_battery);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), color_background);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + 2*bat_thickness, bat_origin.y + 2*bat_thickness + (100 - battery_state.charge_percent) * (bat_height - 4*bat_thickness) / 100), FSize(bat_width - 4*bat_thickness, battery_state.charge_percent * (bat_height - 4*bat_thickness) / 100)), color_battery);
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness*3/2, bat_origin.y - bat_thickness), FSize(bat_width - 3*bat_thickness, bat_thickness)), color_battery);

    // draw the bluetooth popup
    bool bluetooth = bluetooth_connection_service_peek();
    bluetooth_popup(fctx, ctx, bluetooth);

    // end fctx
    fctx_deinit_context(fctx);
}


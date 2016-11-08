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
// -- jsalternative
// -- function remove_leading_zero(buffer, length) {
// --     if (buffer.substring(0, 1) == "0") buffer = buffer.substring(1);
// --     return buffer.replace(new RegExp("([ ./])0", 'g'), "$1");
// -- }
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
// -- end jsalternative

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

    GColor color_accent = COLOR(config_color_accent);
    GColor color_night = GColorBlack;
    GColor color_day = GColorLightGray;
    GColor color_background = GColorBlack;
    GColor color_main = GColorWhite;

    GColor color_battery = color_main;

    // battery status color change
    BatteryChargeState battery_state = battery_state_service_peek();
    if (battery_state.is_charging || battery_state.is_plugged) {
        battery_state.charge_percent = 100;
    }
    if (battery_state.charge_percent <= 10) {
        color_accent = GColorFolly;
    } else if (battery_state.charge_percent <= 20) {
        color_accent = GColorChromeYellow;
    } else if (battery_state.charge_percent <= 30) {
        color_accent = GColorYellow;
    }

    // background
    draw_rect(fctx, bounds_full, color_background);

    // top bar
    fixed_t fontsize_weather = REM(27);
    fixed_t topbar_height = FIXED_ROUND(fontsize_weather + REM(4));
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), color_accent);
    fixed_t pos_weather_y = REM(6);
    bool weather_is_on = config_weather_refresh > 0;
    bool weather_is_available = weather.timestamp > 0;
    bool weather_is_outdated = (time(NULL) - weather.timestamp) > (config_weather_expiration * 60);
    bool show_weather = weather_is_on && weather_is_available && !weather_is_outdated;
    if (show_weather) {
        if (weather.failed) {
            snprintf(buffer_1, 10, "%c", weather.icon);
            snprintf(buffer_2, 10, "%d", weather.temp_cur);
            snprintf(buffer_3, 10, "%d", weather.temp_low);
            snprintf(buffer_4, 10, "%d", weather.temp_high);
        } else {
            snprintf(buffer_1, 10, "%c", weather.icon);
            snprintf(buffer_2, 10, "%d°", weather.temp_cur);
            snprintf(buffer_3, 10, "%d°", weather.temp_low);
            snprintf(buffer_4, 10, "%d°", weather.temp_high);
        }
        draw_weather(fctx, buffer_1, buffer_2, FPoint(width/2, pos_weather_y), color_background, fontsize_weather, GTextAlignmentCenter);
        draw_string(fctx, buffer_3, FPoint(pos_weather_y + REM(2), pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentLeft);
        draw_string(fctx, buffer_4, FPoint(width - pos_weather_y, pos_weather_y), font_main, color_background, fontsize_weather, GTextAlignmentRight);

        // rain preview
        int first_perc_index = -1;
        const int sec_in_hour = 60*60;
        time_t cur_h_ts = time(NULL);
        cur_h_ts -= cur_h_ts % sec_in_hour; // align with hour
        for (int i = 0; i < weather.perc_data_len; i++) {
            if (cur_h_ts == weather.perc_data_ts + i * sec_in_hour) {
                first_perc_index = i;
                break;
            }
        }
        int nHours = 24;
        bool all_zero = true;
        for (int i = 0; i < nHours + 1; i++) {
            uint8_t i_percip_prob = 0;
            if (first_perc_index + i < weather.perc_data_len) {
                i_percip_prob = weather.perc_data[first_perc_index + i];
            }
            if (i_percip_prob != 0) {
                all_zero = false;
                break;
            }
        }
        if (first_perc_index != -1 && !all_zero) {
            fixed_t perc_ti_h = FIXED_ROUND(REM(3));
            fixed_t perc_sep = REM(2); // space between two bars
            fixed_t perc_bar = (width - (nHours + 1) * perc_sep) / nHours; // width of a single bar (without space)
            fixed_t perc_w = perc_sep + perc_bar; // total width occupied by a single hour
            fixed_t perc_maxheight = REM(20); // max height of the precipitation bar
            fixed_t perc_minoffset = - perc_w * (t->tm_min % 60) / 60; // x axis offset into the current hour
            for (int i = 0; i < nHours + 1; i++) {
                uint8_t i_percip_prob = 0;
                if (first_perc_index + i < weather.perc_data_len) {
                    i_percip_prob = weather.perc_data[first_perc_index + i];
                }
                FPoint point = FPoint(perc_minoffset + perc_sep / 2 + i * perc_w, topbar_height + perc_ti_h);
                FSize size = FSize(perc_bar, perc_maxheight * i_percip_prob / 100);
                draw_rect(fctx, FRect(point, size), color_main);
            }
            // rain preview time indicator
            draw_rect(fctx, FRect(FPoint(0, topbar_height), FSize(width, perc_ti_h)), color_day);
            for (int i = -1; i < 2; i++) {
                FPoint point = FPoint(perc_minoffset + (24*i + 18 - t->tm_hour) * perc_w, topbar_height);
                draw_rect(fctx, FRect(point, FSize(12 * perc_w, perc_ti_h)), color_night);
            }
        }
    }

    // time
    fixed_t time_y_offset = PBL_DISPLAY_WIDTH != 144 ? 0 : (height_full-height) / 8;
    setlocale(LC_ALL, "");
    strftime(buffer_1, sizeof(buffer_1), "%I:%M", t);
// -- jsalternative
// --     buffer_1 = 
// -- end jsalternative
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    fixed_t fontsize_time = (fixed_t)(width / 2.2);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time / 2 - time_y_offset), font_main, color_main, fontsize_time, GTextAlignmentCenter);

    // date
    strftime(buffer_1, sizeof(buffer_1), "%A, %m/%d", t);
// -- jsalternative
// --     buffer_1 = 
// -- end jsalternative
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    fixed_t fontsize_date = (fixed_t)(width / 8);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, color_accent, fontsize_date, GTextAlignmentCenter);

    // step bar
    int steps = health_service_sum_today(HealthMetricStepCount);
    int steps_goal = 10000;
    fixed_t pos_stepbar_height = REM(5);
    fixed_t pos_stepbar_endx = width * steps / steps_goal;
    draw_rect(fctx, FRect(FPoint(0, height_full - pos_stepbar_height), FSize(pos_stepbar_endx, pos_stepbar_height)), color_accent);
    draw_circle(fctx, FPoint(pos_stepbar_endx, height_full), pos_stepbar_height, color_accent);
    if (steps > steps_goal) {
        pos_stepbar_endx = width * (steps - steps_goal) / steps_goal;
        draw_rect(fctx, FRect(FPoint(0, height_full - pos_stepbar_height), FSize(pos_stepbar_endx, pos_stepbar_height)), color_main);
        draw_circle(fctx, FPoint(pos_stepbar_endx, height_full), pos_stepbar_height, color_main);
    }

    // heart rate
    HealthValue hr = health_service_peek_current_value(HealthMetricHeartRateBPM);
    if (hr != 0) {
    //    HealthValue resthr = health_service_peek_current_value(HealthMetricRestingHeartRateBPM);
        fixed_t fontsize_hr = REM(25);
        snprintf(buffer_1, 10, "%i", (int)hr);
        draw_string(fctx, "1", FPoint(pos_weather_y, height_full - REM(13)), font_icon, color_main, REM(15), GTextAlignmentLeft);
        draw_string(fctx, buffer_1, FPoint(pos_weather_y + REM(16), height_full - REM(26)), font_main, color_main,fontsize_hr, GTextAlignmentLeft);
    }

    // battery logo (not scaled, to allow pixel-aligned rects)
    fixed_t bat_thickness = PIX(1);
    fixed_t bat_gap_thickness = PIX(1);
    fixed_t bat_height = PIX(15);
    fixed_t bat_width = PIX(9);
    fixed_t bat_sep = PIX(3);
    fixed_t bat_top = PIX(2);
    fixed_t bat_inner_height = bat_height - 2 * bat_thickness - 2 * bat_gap_thickness;
    fixed_t bat_inner_width = bat_width - 2 * bat_thickness - 2 * bat_gap_thickness;
    bool bat_avoid_stepbar = width - (width * steps / steps_goal + pos_stepbar_height) < 2*bat_sep + bat_width;
    FPoint bat_origin = FPoint(width - bat_sep - bat_width, height_full - bat_sep - bat_height - (bat_avoid_stepbar ? pos_stepbar_height : 0));
    // outer rect
    draw_rect(fctx, FRect(bat_origin, FSize(bat_width, bat_height)), color_battery);
    // inner background rect
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness, bat_origin.y + bat_thickness), FSize(bat_width - 2*bat_thickness, bat_height - 2*bat_thickness)), color_background);
    // inner charge rect
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y + bat_thickness + bat_gap_thickness + (100 - battery_state.charge_percent) * bat_inner_height / 100), FSize(
            bat_inner_width, battery_state.charge_percent * bat_inner_height / 100)), color_battery);
    // top of battery
    draw_rect(fctx, FRect(FPoint(bat_origin.x + bat_thickness + bat_gap_thickness, bat_origin.y - bat_top), FSize(bat_inner_width, bat_top)), color_battery);

    // draw the bluetooth popup
    bool bluetooth = bluetooth_connection_service_peek();
    bluetooth_popup(fctx, ctx, bluetooth);

    // end fctx
    fctx_deinit_context(fctx);
}


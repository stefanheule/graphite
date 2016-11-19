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

fixed_t draw_weather(FContext* fctx, bool draw, const char* icon, const char* temp, FPoint position, uint8_t color, fixed_t fontsize, GTextAlignment align) {
    fixed_t weather_fontsize = (fixed_t)(fontsize * 1.15);
    fixed_t w1 = string_width(fctx, icon, font_weather, weather_fontsize);
    fixed_t w2 = string_width(fctx, temp, font_main, fontsize);
    fixed_t sep = REM(2);
    fixed_t w = w1 + w2 + sep;
    GTextAlignment a = GTextAlignmentLeft;

    if (draw) {
        fixed_t icon_y = position.y + weather_fontsize/8;
        if (align == GTextAlignmentCenter) {
            draw_string(fctx, icon, FPoint(position.x - w/2, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w/2 + w1 + sep, position.y), font_main, color, fontsize, a);
        } else if (align == GTextAlignmentLeft) {
            draw_string(fctx, icon, FPoint(position.x, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x + w1 + sep, position.y), font_main, color, fontsize, a);
        } else {
            draw_string(fctx, icon, FPoint(position.x - w, icon_y), font_weather, color, weather_fontsize, a);
            draw_string(fctx, temp, FPoint(position.x - w + w1 + sep, position.y), font_main, color, fontsize, a);
        }
    }

    return w;
}

/** Should the weather information be shown (based on whether it's enabled, available and up-to-date). */
bool show_weather() {
  bool weather_is_on = config_weather_refresh > 0;
  bool weather_is_available = weather.timestamp > 0;
  bool weather_is_outdated = (time(NULL) - weather.timestamp) > (config_weather_expiration * 60);
  bool show_weather = weather_is_on && weather_is_available && !weather_is_outdated;
  return show_weather;
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
    fontsize_complications = REM(27);

    // get current time
    time_t now = time(NULL);
    struct tm *t = localtime(&now);

    // battery status color change
    BatteryChargeState battery_state = battery_state_service_peek();
    if (battery_state.is_charging || battery_state.is_plugged) {
        battery_state.charge_percent = 100;
    }
    if (battery_state.charge_percent <= 10) {
// -- autogen
// -- ## for dep in simple_config_lookup["SIMPLECONFIG_COLOR_ACCENT"]["depends"]
// --       {{ dep | lower }} = GColorFollyARGB8;
// -- ## endfor
      config_color_topbar_bg = GColorFollyARGB8;
      config_color_info_below = GColorFollyARGB8;
      config_color_info_above = GColorFollyARGB8;
      config_color_progress_bar = GColorFollyARGB8;
// -- end autogen
    } else if (battery_state.charge_percent <= 20) {
// -- autogen
// -- ## for dep in simple_config_lookup["SIMPLECONFIG_COLOR_ACCENT"]["depends"]
// --       {{ dep | lower }} = GColorChromeYellowARGB8;
// -- ## endfor
      config_color_topbar_bg = GColorChromeYellowARGB8;
      config_color_info_below = GColorChromeYellowARGB8;
      config_color_info_above = GColorChromeYellowARGB8;
      config_color_progress_bar = GColorChromeYellowARGB8;
// -- end autogen
    } else if (battery_state.charge_percent <= 30) {
// -- autogen
// -- ## for dep in simple_config_lookup["SIMPLECONFIG_COLOR_ACCENT"]["depends"]
// --       {{ dep | lower }} = GColorYellowARGB8;
// -- ## endfor
      config_color_topbar_bg = GColorYellowARGB8;
      config_color_info_below = GColorYellowARGB8;
      config_color_info_above = GColorYellowARGB8;
      config_color_progress_bar = GColorYellowARGB8;
// -- end autogen
    }

    // background
    draw_rect(fctx, bounds_full, config_color_background);

    // top bar
    fixed_t fontsize_weather = fontsize_complications;
    fixed_t topbar_height = FIXED_ROUND(fontsize_weather + REM(4));
    draw_rect(fctx, FRect(bounds.origin, FSize(width, topbar_height)), config_color_topbar_bg);

    // rain preview
    if (show_weather()) {
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
                draw_rect(fctx, FRect(point, size), config_color_perc);
            }
            // rain preview time indicator
            draw_rect(fctx, FRect(FPoint(0, topbar_height), FSize(width, perc_ti_h)), config_color_day);
            for (int i = -1; i < 2; i++) {
                FPoint point = FPoint(perc_minoffset + (24*i + 18 - t->tm_hour) * perc_w, topbar_height);
                draw_rect(fctx, FRect(point, FSize(12 * perc_w, perc_ti_h)), config_color_night);
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
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 - fontsize_time / 2 - time_y_offset), font_main, config_color_time, fontsize_time, GTextAlignmentCenter);

    // date
    strftime(buffer_1, sizeof(buffer_1), "%A, %m/%d", t);
// -- jsalternative
// --     buffer_1 = 
// -- end jsalternative
    remove_leading_zero(buffer_1, sizeof(buffer_1));
    fixed_t fontsize_date = (fixed_t)(width / 8);
    draw_string(fctx, buffer_1, FPoint(width / 2, height_full / 2 + fontsize_time / 3 - time_y_offset), font_main, config_color_info_below, fontsize_date, GTextAlignmentCenter);

    // progress bar
    int progress_cur = health_service_sum_today(HealthMetricStepCount);
    int progress_max = 10000;
    fixed_t progress_height = REM(5);
    fixed_t progress_endx = width * progress_cur / progress_max;
    draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx, progress_height)), config_color_progress_bar);
    draw_circle(fctx, FPoint(progress_endx, height_full), progress_height, config_color_progress_bar);
    if (progress_cur > progress_max) {
        fixed_t progress_endx2 = width * (progress_cur - progress_max) / progress_max;
        draw_rect(fctx, FRect(FPoint(0, height_full - progress_height), FSize(progress_endx2, progress_height)), config_color_progress_bar2);
        draw_circle(fctx, FPoint(progress_endx2, height_full), progress_height, config_color_progress_bar2);
    }

    // top complications
    fixed_t complications_margin_topbottom = REM(6); // gap between watch bounds and complications
    fixed_t complications_margin_leftright = REM(8);
    complications[config_complication_1](fctx, true, FPoint(complications_margin_leftright, complications_margin_topbottom), GTextAlignmentLeft, config_color_top_complications, config_color_topbar_bg);
    complications[config_complication_2](fctx, true, FPoint(width/2, complications_margin_topbottom), GTextAlignmentCenter, config_color_top_complications, config_color_topbar_bg);
    complications[config_complication_3](fctx, true, FPoint(width - complications_margin_leftright, complications_margin_topbottom), GTextAlignmentRight, config_color_top_complications, config_color_topbar_bg);

    // bottom complications
    fixed_t compl_y = height_full - fontsize_complications;
    fixed_t compl_y2 = compl_y - progress_height;
    fixed_t compl_w;
    bool avoid_progress;
    // complication 4 (always higher)
    complications[config_complication_4](fctx, true, FPoint(complications_margin_leftright, compl_y2), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    // complication 5 (sometimes higher)
    compl_w = complications[config_complication_5](fctx, false, FPoint(0,0), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    avoid_progress = width/2 - compl_w/2 < progress_endx + REM(5);
    complications[config_complication_5](fctx, true, FPoint(width/2, avoid_progress ? compl_y2 : compl_y), GTextAlignmentCenter, config_color_bottom_complications, config_color_background);
    // complication 6 (sometimes higher)
    compl_w = complications[config_complication_6](fctx, false, FPoint(0,0), GTextAlignmentLeft, config_color_bottom_complications, config_color_background);
    avoid_progress = width - complications_margin_leftright - compl_w < progress_endx + REM(5);
    complications[config_complication_6](fctx, true, FPoint(width - complications_margin_leftright, avoid_progress ? compl_y2 : compl_y), GTextAlignmentRight, config_color_bottom_complications, config_color_background);

    // draw the bluetooth popup
    bool bluetooth = bluetooth_connection_service_peek();
    bluetooth_popup(fctx, ctx, bluetooth);

    // end fctx
    fctx_deinit_context(fctx);
}


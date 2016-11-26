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

#ifndef REDSHIFT_REDSHIFT_H
#define REDSHIFT_REDSHIFT_H

#include <pebble.h>

// fctx headers
#include <pebble-fctx/fctx.h>
#include <pebble-fctx/ffont.h>

// I don't know how to pass parameters to the compiler, so I'm using this file
// for various configurations
#include "config.h"

#include "settings.h"
#include "ui-util.h"
#include "ui.h"
#include "complications.h"

////////////////////////////////////////////
//// Configuration constants
////////////////////////////////////////////

// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"]
// -- #define {{ key["key"] }} {{ key["id"] }}
// -- ##   endif
// -- ## endfor
#define CONFIG_VIBRATE_DISCONNECT 1
#define CONFIG_VIBRATE_RECONNECT 2
#define CONFIG_MESSAGE_DISCONNECT 3
#define CONFIG_MESSAGE_RECONNECT 4
#define CONFIG_WEATHER_REFRESH 10
#define CONFIG_WEATHER_EXPIRATION 11
#define CONFIG_COLOR_TOPBAR_BG 12
#define CONFIG_COLOR_INFO_BELOW 13
#define CONFIG_COLOR_INFO_ABOVE 14
#define CONFIG_COLOR_PROGRESS_BAR 15
#define CONFIG_COLOR_PROGRESS_BAR2 16
#define CONFIG_COLOR_TIME 17
#define CONFIG_COLOR_PERC 18
#define CONFIG_COLOR_BOTTOM_COMPLICATIONS 19
#define CONFIG_COLOR_BACKGROUND 20
#define CONFIG_COLOR_TOP_COMPLICATIONS 21
#define CONFIG_COLOR_DAY 22
#define CONFIG_COLOR_NIGHT 23
#define CONFIG_COLOR_BAT_30 24
#define CONFIG_COLOR_BAT_20 25
#define CONFIG_COLOR_BAT_10 26
#define CONFIG_LOWBAT_COL 27
#define CONFIG_COMPLICATION_1 29
#define CONFIG_COMPLICATION_2 30
#define CONFIG_COMPLICATION_3 31
#define CONFIG_COMPLICATION_4 32
#define CONFIG_COMPLICATION_5 33
#define CONFIG_COMPLICATION_6 34
#define CONFIG_PROGRESS 35
#define CONFIG_TIME_FORMAT 36
#define CONFIG_INFO_BELOW 37
// -- end autogen

// -- autogen
// -- #define REDSHIFT_N_CONFIG {{ num_config_items }}
#define REDSHIFT_N_CONFIG 37
// -- end autogen

// -- autogen
// -- ## for key in message_keys
// -- #define {{ key["key"] }} {{ key["id"] }}
// -- ## endfor
#define MSG_KEY_WEATHER_TEMP_LOW 100
#define MSG_KEY_WEATHER_TEMP_HIGH 101
#define MSG_KEY_WEATHER_TEMP_CUR 102
#define MSG_KEY_WEATHER_ICON_CUR 103
#define MSG_KEY_WEATHER_PERC_DATA 104
#define MSG_KEY_WEATHER_PERC_DATA_LEN 105
#define MSG_KEY_WEATHER_PERC_DATA_TS 106
#define MSG_KEY_FETCH_WEATHER 107
#define MSG_KEY_WEATHER_FAILED 108
#define MSG_KEY_JS_READY 109
// -- end autogen

// persitant storage keys (in addition to config keys above)
#define PERSIST_KEY_WEATHER 201


////////////////////////////////////////////
//// Configuration values
////////////////////////////////////////////

#define REDSHIFT_STRINGCONFIG_MAXLEN 70

// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"]
// -- ##   if key["type"] != "string"
// -- extern {{ key["type"] | replace("string", "char") }} {{ key["key"] | lower }};
// -- ##   else
// -- extern char {{ key["key"] | lower }}[REDSHIFT_STRINGCONFIG_MAXLEN+1];
// -- ##   endif
// -- ##   endif
// -- ## endfor
extern uint8_t config_vibrate_disconnect;
extern uint8_t config_vibrate_reconnect;
extern uint8_t config_message_disconnect;
extern uint8_t config_message_reconnect;
extern uint16_t config_weather_refresh;
extern uint16_t config_weather_expiration;
extern uint8_t config_color_topbar_bg;
extern uint8_t config_color_info_below;
extern uint8_t config_color_info_above;
extern uint8_t config_color_progress_bar;
extern uint8_t config_color_progress_bar2;
extern uint8_t config_color_time;
extern uint8_t config_color_perc;
extern uint8_t config_color_bottom_complications;
extern uint8_t config_color_background;
extern uint8_t config_color_top_complications;
extern uint8_t config_color_day;
extern uint8_t config_color_night;
extern uint8_t config_color_bat_30;
extern uint8_t config_color_bat_20;
extern uint8_t config_color_bat_10;
extern uint8_t config_lowbat_col;
extern uint8_t config_complication_1;
extern uint8_t config_complication_2;
extern uint8_t config_complication_3;
extern uint8_t config_complication_4;
extern uint8_t config_complication_5;
extern uint8_t config_complication_6;
extern uint8_t config_progress;
extern char config_time_format[REDSHIFT_STRINGCONFIG_MAXLEN+1];
extern char config_info_below[REDSHIFT_STRINGCONFIG_MAXLEN+1];
// -- end autogen


////////////////////////////////////////////
//// Complications
////////////////////////////////////////////

// complications take a parameter draw and only will actually draw the content
// if draw==true.  Otherwise they just return the width of the complication.
typedef fixed_t (*complication_render_t)(FContext* fctx, bool draw, FPoint position, GTextAlignment align, uint8_t foreground_color, uint8_t background_color);
extern complication_render_t complications[];


////////////////////////////////////////////
//// Global variables
////////////////////////////////////////////

extern Window *window;
extern Layer *layer_background;
extern char buffer_1[30];
extern char buffer_2[30];
extern char buffer_3[30];
extern char buffer_4[30];
extern fixed_t height;
extern fixed_t width;
extern fixed_t height_full;
extern fixed_t width_full;
extern FFont* font_main;
extern FFont* font_weather;
extern FFont* font_icon;
extern fixed_t fontsize_complications;

extern bool show_bluetooth_popup;
extern AppTimer *timer_bluetooth_popup;

// this definition should be updated whenever the Weather struct, or it's semantic meaning changes.  this ensures that no outdated values are read from storage
#define REDSHIFT_WEATHER_VERSION 2
// -- autogen
// -- #define REDSHIFT_WEATHER_PERC_MAX_LEN {{ perc_max_len }}
#define REDSHIFT_WEATHER_PERC_MAX_LEN 30
// -- end autogen
typedef struct {
    uint8_t version;
    time_t timestamp;
    int8_t icon;
    int8_t temp_cur;
    int8_t temp_low;
    int8_t temp_high;
    uint8_t perc_data[REDSHIFT_WEATHER_PERC_MAX_LEN];
    uint8_t perc_data_len; // maybe not all perc data items are valid
    time_t perc_data_ts;
    bool failed;
} __attribute__((__packed__)) Weather;

extern Weather weather;
extern bool js_ready;
extern AppTimer * weather_request_timer;

////////////////////////////////////////////
//// Static configuration and useful macros
////////////////////////////////////////////

#define COLOR(c) ((GColor8) { .argb = (c) })
#define MAX(x,y) ((x) < (y) ? (y) : (x))

#define REDSHIFT_BLUETOOTH_POPUP_MS 5000

#define REDSHIFT_OUTBOX_SIZE 100
#define REDSHIFT_WEATHER_N_INTS 6 // 3 temps + 1 icon + data len + data timestamp
#define REDSHIFT_WEATHER_HOURS 30
// 100 + an upper bound for all the configuration items we have OR the amount of data sent as weather update
#define REDSHIFT_INBOX_SIZE (100 + MAX(1 + (REDSHIFT_N_CONFIG) * (7+4), REDSHIFT_WEATHER_N_INTS * 4 + REDSHIFT_WEATHER_HOURS * 4))

#define PIX(x) (INT_TO_FIXED(x))
// returns a fixed_t value that corresponds to a relatively scaled version, where 1 rem is 1/200 of the screen width
#define REM(x) ((fixed_t)(INT_TO_FIXED(x) * PBL_DISPLAY_WIDTH / 200))
// round to a nearest pixel (from fixed to fixed)
#define FIXED_ROUND(x) ((x) % FIXED_POINT_SCALE < FIXED_POINT_SCALE/2 ? (x) - ((x) % FIXED_POINT_SCALE) : (x) + FIXED_POINT_SCALE - ((x) % FIXED_POINT_SCALE))


////////////////////////////////////////////
//// screenshot configurations
////////////////////////////////////////////


#endif //REDSHIFT_REDSHIFT_H

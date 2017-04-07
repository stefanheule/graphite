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


#include "graphite.h"


////////////////////////////////////////////
//// Global variables
////////////////////////////////////////////

// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"]
// -- ##   if key["type"] != "string"
// -- {{ key["type"] }} {{ key["key"] | lower }} = {{ key["default"]}};
// -- ##   else
// -- char {{ key["key"] | lower }}[GRAPHITE_STRINGCONFIG_MAXLEN+1] = {{ key["default"]}};
// -- ##   endif
// -- ##   endif
// -- ## endfor
uint8_t config_vibrate_disconnect = true;
uint8_t config_vibrate_reconnect = true;
uint8_t config_message_disconnect = true;
uint8_t config_message_reconnect = true;
uint16_t config_weather_refresh = 60;
uint16_t config_weather_expiration = 3*60;
uint16_t config_weather_refresh_failed = 30;
uint8_t config_color_topbar_bg = GColorVividCeruleanARGB8;
uint8_t config_color_info_below = GColorVividCeruleanARGB8;
uint8_t config_color_progress_bar = GColorVividCeruleanARGB8;
uint8_t config_color_progress_bar2 = GColorWhiteARGB8;
uint8_t config_color_time = GColorWhiteARGB8;
uint8_t config_color_perc = GColorWhiteARGB8;
uint8_t config_color_widget_1 = GColorBlackARGB8;
uint8_t config_color_widget_2 = GColorBlackARGB8;
uint8_t config_color_widget_3 = GColorBlackARGB8;
uint8_t config_color_widget_4 = GColorWhiteARGB8;
uint8_t config_color_widget_5 = GColorWhiteARGB8;
uint8_t config_color_widget_6 = GColorWhiteARGB8;
uint8_t config_color_background = GColorBlackARGB8;
uint8_t config_color_day = GColorLightGrayARGB8;
uint8_t config_color_night = GColorBlackARGB8;
uint8_t config_color_bat_30 = GColorYellowARGB8;
uint8_t config_color_bat_20 = GColorChromeYellowARGB8;
uint8_t config_color_bat_10 = GColorFollyARGB8;
uint8_t config_lowbat_col = false;
uint8_t config_widget_1 = 4;
uint8_t config_widget_2 = 1;
uint8_t config_widget_3 = 5;
uint8_t config_widget_4 = 14;
uint8_t config_widget_5 = 6;
uint8_t config_widget_6 = 9;
uint8_t config_progress = 1;
char config_time_format[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%I:0%M";
char config_info_below[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%A, %m/%d";
uint8_t config_update_second = 0;
uint8_t config_show_daynight = true;
uint16_t config_step_goal = 10000;
char config_tz_0_format[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%I:0%M%P";
char config_tz_1_format[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%I:0%M%P";
char config_tz_2_format[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%I:0%M%P";
uint8_t config_hourly_vibrate = false;
char config_sunrise_format[GRAPHITE_STRINGCONFIG_MAXLEN+1] = "%I:0%M";
uint8_t config_widget_7 = 38;
uint8_t config_widget_8 = 0;
uint8_t config_widget_9 = 42;
uint8_t config_widget_10 = 0;
uint8_t config_widget_11 = 0;
uint8_t config_widget_12 = 32;
uint16_t config_timeout_2nd_widgets = 3000;
uint8_t config_2nd_widgets = true;
uint16_t config_weather_sunrise_expiration = 48;
uint8_t config_color_quiet_mode = GColorLavenderIndigoARGB8;
uint8_t config_quiet_col = false;
// -- end autogen


/** A pointer to our window, for later deallocation. */
Window *window;

/** All layers */
Layer *layer_background;

/** Buffers for strings */
char buffer_1[GRAPHITE_STRINGCONFIG_MAXLEN+1];
char buffer_2[GRAPHITE_STRINGCONFIG_MAXLEN+1];

/** The height and width of the watch */
fixed_t height;
fixed_t width;
fixed_t height_full;

/** Fonts. */
FFont* font_main;
FFont* font_weather;
FFont* font_icon;
fixed_t fontsize_widgets;

/** Is the bluetooth popup current supposed to be shown? */
bool show_bluetooth_popup;

/** The timer for the bluetooth popup */
AppTimer *timer_bluetooth_popup;

/** The current weather information. */
Weather weather;

/** Is the JS runtime ready? */
bool js_ready;

/** A timer used to schedule weather updates. */
AppTimer * weather_request_timer;

/** The timezone information. */
TimeZoneInfo tzinfo;

/** Timer for taps. */
AppTimer *timer_tap;
bool tap_subscribed = false;

/** Should we show the secondary set of widgets? */
bool show_secondary_widgets;



////////////////////////////////////////////
//// Implementation
////////////////////////////////////////////

bool user_sleeping() {
    HealthActivityMask activities = health_service_peek_current_activities();
    if (activities & HealthActivitySleep) {
        return true;
    } else if (activities & HealthActivityRestfulSleep) {
        return true;
    } else {
        return false;
    }
}

/**
 * Handler for time ticks.
 */
void handle_second_tick(struct tm *tick_time, TimeUnits units_changed) {
    if (config_update_second == 0 || (tick_time->tm_sec == 0) || ((tick_time->tm_sec % config_update_second) == 0)) {
        layer_mark_dirty(layer_background);
    }
    if (!quiet_time_is_active() && config_hourly_vibrate) {
        if ((units_changed & MINUTE_UNIT) != 0) {
            if ((tick_time->tm_min % config_hourly_vibrate) == 0) {
                if (!user_sleeping()) {
                    vibes_short_pulse();
                }
            }
        }
    }
}

void timer_callback_bluetooth_popup(void *data) {
    show_bluetooth_popup = false;
    timer_bluetooth_popup = NULL;
    layer_mark_dirty(layer_background);
}

void handle_bluetooth(bool connected) {
    // redraw background (to turn on/off the logo)
    layer_mark_dirty(layer_background);

    bool show_popup = false;
    bool vibrate = false;
    if ((config_message_reconnect && connected) || (config_message_disconnect && !connected)) {
        show_popup = true;
    }
    if ((config_vibrate_reconnect && connected) || (config_vibrate_disconnect && !connected)) {
        vibrate = true;
    }

    // vibrate
    bool sleep_or_quiet = quiet_time_is_active() || user_sleeping();
    if (vibrate && !sleep_or_quiet) {
        vibes_double_pulse();
    }

    // turn light on
    if (show_popup && !sleep_or_quiet) {
        light_enable_interaction();
    }

    // show popup
    if (show_popup) {
        show_bluetooth_popup = true;
        if (timer_bluetooth_popup) {
            app_timer_reschedule(timer_bluetooth_popup, GRAPHITE_BLUETOOTH_POPUP_MS);
        } else {
            timer_bluetooth_popup = app_timer_register(GRAPHITE_BLUETOOTH_POPUP_MS, timer_callback_bluetooth_popup,
                                                       NULL);
        }
    }
}

/**
 * Window load callback.
 */
void window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_bounds(window_layer);

    // create layer
    layer_background = layer_create(bounds);
    layer_set_update_proc(layer_background, background_update_proc);
    layer_add_child(window_layer, layer_background);

    // load fonts
    font_main = ffont_create_from_resource(RESOURCE_ID_MAIN_FFONT);
    font_weather = ffont_create_from_resource(RESOURCE_ID_WEATHER_FFONT);
    font_icon = ffont_create_from_resource(RESOURCE_ID_ICON_FFONT);

    // initialize
    show_bluetooth_popup = false;
}

/**
 * Window unload callback.
 */
void window_unload(Window *window) {
    layer_destroy(layer_background);
    ffont_destroy(font_main);
    ffont_destroy(font_weather);
    ffont_destroy(font_icon);
}

void subscribe_tick(bool also_unsubscribe) {
    if (also_unsubscribe) {
        tick_timer_service_unsubscribe();
    }
    TimeUnits unit = MINUTE_UNIT;
    if (config_update_second > 0) {
        unit = SECOND_UNIT;
    }
    tick_timer_service_subscribe(unit, handle_second_tick);
}

void handle_battery(BatteryChargeState new_state) {
    layer_mark_dirty(layer_background);
}

void end_tap(void* data) {
    timer_tap = NULL;
    show_secondary_widgets = false;
    layer_mark_dirty(layer_background);
}

void handle_tap(AccelAxisType axis, int32_t direction) {
    show_secondary_widgets = true;
    if (timer_tap) {
        app_timer_reschedule(timer_tap, config_timeout_2nd_widgets);
    } else {
        timer_tap = app_timer_register(config_timeout_2nd_widgets, end_tap,
                                                   NULL);
    }
    layer_mark_dirty(layer_background);
}

void subscribe_tap() {
    if (tap_subscribed) {
        accel_tap_service_unsubscribe();
        tap_subscribed = false;
    }
    if (!config_2nd_widgets) return;
    accel_tap_service_subscribe(handle_tap);
    tap_subscribed = true;
}

/**
 * Initialization.
 */
void init() {
    setlocale(LC_ALL, "");

    read_config_all();

    window = window_create();
    window_set_window_handlers(window, (WindowHandlers) {
            .load = window_load,
            .unload = window_unload,
    });
    window_stack_push(window, true);

    subscribe_tick(false);
    bluetooth_connection_service_subscribe(handle_bluetooth);
    battery_state_service_subscribe(handle_battery);
    subscribe_tap();

    app_message_open(GRAPHITE_INBOX_SIZE, GRAPHITE_OUTBOX_SIZE);
    app_message_register_inbox_received(inbox_received_handler);
}

/**
 * De-initialisation.
 */
void deinit() {
    tick_timer_service_unsubscribe();
    battery_state_service_unsubscribe();
    bluetooth_connection_service_unsubscribe();
    accel_tap_service_unsubscribe();

    window_destroy(window);

    app_message_deregister_callbacks();
}

/**
 * Main entry point.
 */
int main() {
    init();
    app_event_loop();
    deinit();
}

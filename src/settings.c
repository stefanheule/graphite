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
#include "settings.h"
#include "graphite.h"


static void update_weather_helper(void *unused);

void set_weather_timer(int timeout_min) {
    const uint32_t timeout_ms = timeout_min * 1000 * 60;
    if (weather_request_timer) {
        if (!app_timer_reschedule(weather_request_timer, timeout_ms)) {
            weather_request_timer = app_timer_register(timeout_ms, update_weather_helper, NULL);
        }
    } else {
        weather_request_timer = app_timer_register(timeout_ms, update_weather_helper, NULL);
    }
}

/**
 * Update the weather information (and schedule a periodic timer to update again)
 */
void update_weather(bool force) {
    // return if we don't want weather information
    if (config_weather_refresh == 0) return;

    bool need_weather = false;
    uint32_t timeout_min = config_weather_refresh;
    if (weather.timestamp == 0) {
        need_weather = true;
    } else {
        need_weather = (time(NULL) - weather.timestamp) > (config_weather_refresh * 60);
        if (!need_weather) {
            timeout_min = (time(NULL) - weather.timestamp) / 60;
        }
    }
    set_weather_timer(timeout_min);
    if (!need_weather && !force) return;

    // actually update the weather by sending a request
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, MSG_KEY_FETCH_WEATHER, 1);
    app_message_outbox_send();
// -- build=debug
// --     APP_LOG(APP_LOG_LEVEL_INFO, "requesting weather update");
    APP_LOG(APP_LOG_LEVEL_INFO, "requesting weather update");
// -- end build
}

/**
 * Utility function.
 */
static void update_weather_helper(void *unused) {
    weather_request_timer = NULL;
    update_weather(false);
}

int8_t get_current_tz_idx(TZData* data) {
    // do we have valid data?
    if (!data->valid) return -1;

    time_t now = time(NULL);
    int i = 0;
    while (i < GRAPHITE_TZ_MAX_DATAPOINTS) {
        if (data->untils[i] == 0) return -1;
        if (now < data->untils[i]) return i;
        i += 1;
    }
    return -1;
}
/**
 * Check if we need to update the timezone.
 */
void check_update_tz_helper(uint8_t idx, uint32_t key) {
    // return if we don't use the timezone widget
    // TODO

    // check if we have valid time zone information
    time_t now = time(NULL);
    int8_t dataidx = get_current_tz_idx(&tzinfo.data[idx]);

    if (dataidx >= 0) {
        // check if it expires soon
        if (tzinfo.data[idx].untils[dataidx] - now < 100) {
            // check if there is more
            if (dataidx < GRAPHITE_TZ_MAX_DATAPOINTS-1 && tzinfo.data[idx].untils[dataidx+1] != 0) {
                // there is more
                return;
            }
        } else {
            // it doesn't
            return;
        }
    }

    // actually request a tz update
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, key, 1);
    app_message_outbox_send();

// -- build=debug
// --     APP_LOG(APP_LOG_LEVEL_INFO, "requesting tz update for %d", idx);
    APP_LOG(APP_LOG_LEVEL_INFO, "requesting tz update for %d", idx);
// -- end build
}
void check_update_tz() {
// -- autogen
// -- ## for i in range(num_tzs)
// --     check_update_tz_helper({{ i }}, MSG_KEY_FETCH_TZ_{{ i }});
// -- ## endfor
    check_update_tz_helper(0, MSG_KEY_FETCH_TZ_0);
    check_update_tz_helper(1, MSG_KEY_FETCH_TZ_1);
    check_update_tz_helper(2, MSG_KEY_FETCH_TZ_2);
// -- end autogen
}

/**
 * Helpers to process new configuration.
 */
bool sync_helper_uint8_t(const uint32_t key, DictionaryIterator *iter, uint8_t *value) {
    Tuple *new_tuple = dict_find(iter, key);
    if (new_tuple == NULL) return false;
    if ((*value) != new_tuple->value->uint8) {
        (*value) = new_tuple->value->uint8;
        persist_write_int(key, *value);
        return true;
    }
    return false;
}
bool sync_helper_uint16_t(const uint32_t key, DictionaryIterator *iter, uint16_t *value) {
    Tuple *new_tuple = dict_find(iter, key);
    if (new_tuple == NULL) return false;
    if ((*value) != new_tuple->value->uint16) {
        (*value) = new_tuple->value->uint16;
        persist_write_int(key, *value);
        return true;
    }
    return false;
}
bool sync_helper_string(const uint32_t key, DictionaryIterator *iter, char *buffer) {
    int maxlen = GRAPHITE_STRINGCONFIG_MAXLEN;
    Tuple *new_tuple = dict_find(iter, key);
    if (new_tuple == NULL) return false;
    if (strncmp(buffer, new_tuple->value->cstring, maxlen) != 0) {
        strncpy(buffer, new_tuple->value->cstring, maxlen);
        persist_write_string(key, buffer);
        return true;
    }
    return false;
}

uint32_t decode_bytes_to_int(uint8_t *bytes, uint8_t nbytes) {
    uint32_t res = 0;
    for (int i = nbytes - 1; i >= 0; i--) {
        res = (res * 256) + bytes[i];
    }
    return res;
}

bool sync_tz(uint8_t idx, const uint32_t key, DictionaryIterator *iter) {
    Tuple *tz_data;
    tz_data = dict_find(iter, key);
    if (tz_data) {
        tzinfo.data[idx].valid = true;
        int i = 0;
// -- build=debug
// --             APP_LOG(APP_LOG_LEVEL_DEBUG, "received tz data:");
            APP_LOG(APP_LOG_LEVEL_DEBUG, "received tz data:");
// -- end build
        while (i < GRAPHITE_TZ_MAX_DATAPOINTS) {
            tzinfo.data[idx].untils[i] = decode_bytes_to_int(tz_data->value->data + i * 6, 4);
            if (tzinfo.data[idx].untils[i] != 0) {
                tzinfo.data[idx].offsets[i] = decode_bytes_to_int(tz_data->value->data + i * 6 + 4, 2);
            } else {
                break;
            }
// -- build=debug
// --             APP_LOG(APP_LOG_LEVEL_DEBUG, "  until  = %d", tzinfo.data[idx].untils[i]);
// --             APP_LOG(APP_LOG_LEVEL_DEBUG, "  offset = %d", tzinfo.data[idx].offsets[i]);
            APP_LOG(APP_LOG_LEVEL_DEBUG, "  until  = %d", tzinfo.data[idx].untils[i]);
            APP_LOG(APP_LOG_LEVEL_DEBUG, "  offset = %d", tzinfo.data[idx].offsets[i]);
// -- end build
            i += 1;
        }
        while (i < GRAPHITE_TZ_MAX_DATAPOINTS) {
            tzinfo.data[idx].untils[i] = 0;
            i += 1;
        }
        tzinfo.version = GRAPHITE_TZ_DATA_VERSION;
        persist_write_data(PERSIST_KEY_TZ, &tzinfo, sizeof(TimeZoneInfo));
        return true;
    }
    return false;
}

typedef struct {
    uint8_t key;
    void* var;
} __attribute__((__packed__)) ConfigKeyAddr;

ConfigKeyAddr config_ka_8bit[] = {
// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"] and key["type"] == "uint8_t"
// --     { .key = {{ key["key"] }}, .var = &{{ key["key"] | lower }} },
// -- ##   endif
// -- ## endfor
    { .key = CONFIG_VIBRATE_DISCONNECT, .var = &config_vibrate_disconnect },
    { .key = CONFIG_VIBRATE_RECONNECT, .var = &config_vibrate_reconnect },
    { .key = CONFIG_MESSAGE_DISCONNECT, .var = &config_message_disconnect },
    { .key = CONFIG_MESSAGE_RECONNECT, .var = &config_message_reconnect },
    { .key = CONFIG_COLOR_TOPBAR_BG, .var = &config_color_topbar_bg },
    { .key = CONFIG_COLOR_INFO_BELOW, .var = &config_color_info_below },
    { .key = CONFIG_COLOR_PROGRESS_BAR, .var = &config_color_progress_bar },
    { .key = CONFIG_COLOR_PROGRESS_BAR2, .var = &config_color_progress_bar2 },
    { .key = CONFIG_COLOR_TIME, .var = &config_color_time },
    { .key = CONFIG_COLOR_PERC, .var = &config_color_perc },
    { .key = CONFIG_COLOR_WIDGET_1, .var = &config_color_widget_1 },
    { .key = CONFIG_COLOR_WIDGET_2, .var = &config_color_widget_2 },
    { .key = CONFIG_COLOR_WIDGET_3, .var = &config_color_widget_3 },
    { .key = CONFIG_COLOR_WIDGET_4, .var = &config_color_widget_4 },
    { .key = CONFIG_COLOR_WIDGET_5, .var = &config_color_widget_5 },
    { .key = CONFIG_COLOR_WIDGET_6, .var = &config_color_widget_6 },
    { .key = CONFIG_COLOR_BACKGROUND, .var = &config_color_background },
    { .key = CONFIG_COLOR_DAY, .var = &config_color_day },
    { .key = CONFIG_COLOR_NIGHT, .var = &config_color_night },
    { .key = CONFIG_COLOR_BAT_30, .var = &config_color_bat_30 },
    { .key = CONFIG_COLOR_BAT_20, .var = &config_color_bat_20 },
    { .key = CONFIG_COLOR_BAT_10, .var = &config_color_bat_10 },
    { .key = CONFIG_LOWBAT_COL, .var = &config_lowbat_col },
    { .key = CONFIG_WIDGET_1, .var = &config_widget_1 },
    { .key = CONFIG_WIDGET_2, .var = &config_widget_2 },
    { .key = CONFIG_WIDGET_3, .var = &config_widget_3 },
    { .key = CONFIG_WIDGET_4, .var = &config_widget_4 },
    { .key = CONFIG_WIDGET_5, .var = &config_widget_5 },
    { .key = CONFIG_WIDGET_6, .var = &config_widget_6 },
    { .key = CONFIG_PROGRESS, .var = &config_progress },
    { .key = CONFIG_UPDATE_SECOND, .var = &config_update_second },
    { .key = CONFIG_SHOW_DAYNIGHT, .var = &config_show_daynight },
    { .key = CONFIG_HOURLY_VIBRATE, .var = &config_hourly_vibrate },
    { .key = CONFIG_WIDGET_7, .var = &config_widget_7 },
    { .key = CONFIG_WIDGET_8, .var = &config_widget_8 },
    { .key = CONFIG_WIDGET_9, .var = &config_widget_9 },
    { .key = CONFIG_WIDGET_10, .var = &config_widget_10 },
    { .key = CONFIG_WIDGET_11, .var = &config_widget_11 },
    { .key = CONFIG_WIDGET_12, .var = &config_widget_12 },
    { .key = CONFIG_2ND_WIDGETS, .var = &config_2nd_widgets },
// -- end autogen
};
ConfigKeyAddr config_ka_16bit[] = {
// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"] and key["type"] == "uint16_t"
// --     { .key = {{ key["key"] }}, .var = &{{ key["key"] | lower }} },
// -- ##   endif
// -- ## endfor
    { .key = CONFIG_WEATHER_REFRESH, .var = &config_weather_refresh },
    { .key = CONFIG_WEATHER_EXPIRATION, .var = &config_weather_expiration },
    { .key = CONFIG_WEATHER_REFRESH_FAILED, .var = &config_weather_refresh_failed },
    { .key = CONFIG_STEP_GOAL, .var = &config_step_goal },
    { .key = CONFIG_TIMEOUT_2ND_WIDGETS, .var = &config_timeout_2nd_widgets },
    { .key = CONFIG_WEATHER_SUNRISE_EXPIRATION, .var = &config_weather_sunrise_expiration },
// -- end autogen
};
ConfigKeyAddr config_ka_string[] = {
// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"] and key["type"] == "string"
// --     { .key = {{ key["key"] }}, .var = {{ key["key"] | lower }} },
// -- ##   endif
// -- ## endfor
    { .key = CONFIG_TIME_FORMAT, .var = config_time_format },
    { .key = CONFIG_INFO_BELOW, .var = config_info_below },
    { .key = CONFIG_TZ_0_FORMAT, .var = config_tz_0_format },
    { .key = CONFIG_TZ_1_FORMAT, .var = config_tz_1_format },
    { .key = CONFIG_TZ_2_FORMAT, .var = config_tz_2_format },
    { .key = CONFIG_SUNRISE_FORMAT, .var = config_sunrise_format },
// -- end autogen
};


void inbox_received_handler(DictionaryIterator *iter, void *context) {
// -- build=debug
// --     APP_LOG(APP_LOG_LEVEL_DEBUG, "received message");
    APP_LOG(APP_LOG_LEVEL_DEBUG, "received message");
// -- end build

    bool dirty = false;
    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_8bit); i++) {
        dirty |= sync_helper_uint8_t(config_ka_8bit[i].key, iter, config_ka_8bit[i].var);
    }
    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_16bit); i++) {
        dirty |= sync_helper_uint16_t(config_ka_16bit[i].key, iter, config_ka_16bit[i].var);
    }
    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_string); i++) {
        dirty |= sync_helper_string(config_ka_string[i].key, iter, config_ka_string[i].var);
    }

    bool ask_for_weather_update = true;
    bool force_weather_update = true;

    Tuple *icon_tuple = dict_find(iter, MSG_KEY_WEATHER_ICON_CUR);
    Tuple *tempcur_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_CUR);
    Tuple *templow_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_LOW);
    Tuple *temphigh_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_HIGH);
    Tuple *perc_data_tuple = dict_find(iter, MSG_KEY_WEATHER_PERC_DATA);
    Tuple *perc_data_ts_tuple = dict_find(iter, MSG_KEY_WEATHER_PERC_DATA_TS);
    Tuple *perc_data_len_tuple = dict_find(iter, MSG_KEY_WEATHER_PERC_DATA_LEN);
    Tuple *sunrise_tuple = dict_find(iter, MSG_KEY_WEATHER_SUNRISE);
    Tuple *sunset_tuple = dict_find(iter, MSG_KEY_WEATHER_SUNSET);
    if (icon_tuple && tempcur_tuple && templow_tuple && temphigh_tuple) {
        weather.version = GRAPHITE_WEATHER_VERSION;
        weather.timestamp = time(NULL);
        weather.icon = icon_tuple->value->int8;
        weather.temp_cur = tempcur_tuple->value->int16;
        weather.temp_low = templow_tuple->value->int16;
        weather.temp_high = temphigh_tuple->value->int16;

        if (perc_data_tuple && perc_data_ts_tuple && perc_data_len_tuple) {
            weather.perc_data_len = perc_data_len_tuple->value->uint8;
            weather.perc_data_ts = perc_data_ts_tuple->value->int32;
            for (int i = 0; i < weather.perc_data_len && i < GRAPHITE_WEATHER_PERC_MAX_LEN; i++) {
                weather.perc_data[i] = perc_data_tuple->value->data[i];
            }
        } else {
            weather.perc_data_len = 0;
            weather.perc_data_ts = 0;
        }

        if (sunrise_tuple && sunset_tuple) {
            weather.sunrise = sunrise_tuple->value->int32;
            weather.sunset = sunset_tuple->value->int32;
        } else {
            weather.sunrise = 0;
            weather.sunset = 0;
        }

        weather.failed = false;
        persist_write_data(PERSIST_KEY_WEATHER, &weather, sizeof(Weather));
        dirty = true;
        ask_for_weather_update = false;
    }
    if (dict_find(iter, MSG_KEY_WEATHER_FAILED)) {
        // retry early when weather update failed
        set_weather_timer(config_weather_refresh_failed);
        ask_for_weather_update = false;
        weather.failed = true;
    }

    bool ask_for_tz_update = true;
// -- autogen
// --     if (false
// -- ## for i in range(num_tzs)
// --     | sync_tz({{ i }}, MSG_KEY_TZ_{{ i }}, iter)
// -- ## endfor
// --     ) { dirty = true; ask_for_tz_update = false; }
    if (false
    | sync_tz(0, MSG_KEY_TZ_0, iter)
    | sync_tz(1, MSG_KEY_TZ_1, iter)
    | sync_tz(2, MSG_KEY_TZ_2, iter)
    ) { dirty = true; ask_for_tz_update = false; }
// -- end autogen
    if (!ask_for_tz_update) ask_for_weather_update = false;

    if (dict_find(iter, MSG_KEY_JS_READY)) {
        js_ready = true;
        force_weather_update = false;
    }
    if (dirty) {
        // make sure we update tick frequency if necessary
        subscribe_tick(true);
        subscribe_tap();
        layer_mark_dirty(layer_background);
    }
    if (ask_for_weather_update) {
        update_weather(force_weather_update);
    }
    if (ask_for_tz_update) {
        check_update_tz();
    }
}

/**
 * Read a value from the persistent storage (or load the default value).
 */
void read_config_uint8_t(const uint32_t key, uint8_t *value) {
    if (persist_exists(key)) {
        *value = persist_read_int(key);
    } else {
        persist_write_int(key, *value);
    }
}
void read_config_uint16_t(const uint32_t key, uint16_t *value) {
    if (persist_exists(key)) {
        *value = persist_read_int(key);
    } else {
        persist_write_int(key, *value);
    }
}
void read_config_string(const uint32_t key, char *buffer) {
    if (persist_exists(key)) {
        persist_read_string(key, buffer, GRAPHITE_STRINGCONFIG_MAXLEN);
    } else {
        persist_write_string(key, buffer);
    }
}


/**
 * Read all items from the configuration storage.
 */
void read_config_all() {

    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_8bit); i++) {
        read_config_uint8_t(config_ka_8bit[i].key, config_ka_8bit[i].var);
    }
    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_16bit); i++) {
        read_config_uint16_t(config_ka_16bit[i].key, config_ka_16bit[i].var);
    }
    for (unsigned i = 0; i < ARRAY_LENGTH(config_ka_string); i++) {
        read_config_string(config_ka_string[i].key, config_ka_string[i].var);
    }

    if (persist_exists(PERSIST_KEY_WEATHER) && persist_get_size(PERSIST_KEY_WEATHER) == sizeof(Weather)) {
        Weather tmp;
        persist_read_data(PERSIST_KEY_WEATHER, &tmp, sizeof(Weather));
        // make sure we are reading weather info that's consistent with the current version number
        if (tmp.version == GRAPHITE_WEATHER_VERSION) {
            weather = tmp;
        } else {
            weather.timestamp = 0;
        }
    } else {
        weather.timestamp = 0;
    }

    if (persist_exists(PERSIST_KEY_TZ) && persist_get_size(PERSIST_KEY_TZ) == sizeof(TimeZoneInfo)) {
        TimeZoneInfo tmp;
        persist_read_data(PERSIST_KEY_TZ, &tmp, sizeof(TimeZoneInfo));
        // make sure we are reading tz info that's consistent with the current version number
        if (tmp.version == GRAPHITE_TZ_DATA_VERSION) {
            tzinfo = tmp;
        } else {
// -- autogen
// -- ## for i in range(num_tzs)
// --             tzinfo.data[{{ i }}].valid = false;
// -- ## endfor
            tzinfo.data[0].valid = false;
            tzinfo.data[1].valid = false;
            tzinfo.data[2].valid = false;
// -- end autogen
        }
    } else {
// -- autogen
// -- ## for i in range(num_tzs)
// --         tzinfo.data[{{ i }}].valid = false;
// -- ## endfor
        tzinfo.data[0].valid = false;
        tzinfo.data[1].valid = false;
        tzinfo.data[2].valid = false;
// -- end autogen
    }

    js_ready = false;
}

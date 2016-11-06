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
#include "redshift.h"


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
void update_weather() {
    // return if we don't want weather information
    if (config_weather_refresh == 0) return;

    const uint32_t timeout_min = config_weather_refresh;
    set_weather_timer(timeout_min);

    // actually update the weather by sending a request
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, MSG_KEY_FETCH_WEATHER, 1);
    app_message_outbox_send();
    APP_LOG(APP_LOG_LEVEL_INFO, "requesting weather update");
}

/**
 * Utility function.
 */
static void update_weather_helper(void *unused) {
    update_weather();
}

/**
 * Helper to process new configuration.
 */
bool sync_helper(const uint32_t key, DictionaryIterator *iter, uint8_t *value) {
    Tuple *new_tuple = dict_find(iter, key);
    if (new_tuple == NULL) return false;
    if ((*value) != new_tuple->value->uint8) {
        (*value) = new_tuple->value->uint8;
        persist_write_int(key, *value);
        return true;
    }
    return false;
}

/**
 * Helper to process new configuration.
 */
bool sync_helper_2(const uint32_t key, DictionaryIterator *iter, uint16_t *value) {
    Tuple *new_tuple = dict_find(iter, key);
    if (new_tuple == NULL) return false;
    if ((*value) != new_tuple->value->uint16) {
        (*value) = new_tuple->value->uint16;
        persist_write_int(key, *value);
        return true;
    }
    return false;
}

void inbox_received_handler(DictionaryIterator *iter, void *context) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "received message");
    bool dirty = false;
// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"]
// --     dirty |= sync_helper{% if key["type"] == "uint16_t" %}_2{% endif %}({{ key["key"] }}, iter, &{{ key["key"] | lower }});
// -- ##   endif
// -- ## endfor
    dirty |= sync_helper(CONFIG_VIBRATE_DISCONNECT, iter, &config_vibrate_disconnect);
    dirty |= sync_helper(CONFIG_VIBRATE_RECONNECT, iter, &config_vibrate_reconnect);
    dirty |= sync_helper(CONFIG_MESSAGE_DISCONNECT, iter, &config_message_disconnect);
    dirty |= sync_helper(CONFIG_MESSAGE_RECONNECT, iter, &config_message_reconnect);
    dirty |= sync_helper_2(CONFIG_WEATHER_REFRESH, iter, &config_weather_refresh);
    dirty |= sync_helper_2(CONFIG_WEATHER_EXPIRATION, iter, &config_weather_expiration);
// -- end autogen

    bool ask_for_weather_update = true;

    Tuple *icon_tuple = dict_find(iter, MSG_KEY_WEATHER_ICON_CUR);
    Tuple *tempcur_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_CUR);
    Tuple *templow_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_LOW);
    Tuple *temphigh_tuple = dict_find(iter, MSG_KEY_WEATHER_TEMP_HIGH);
    if (icon_tuple && tempcur_tuple && templow_tuple && temphigh_tuple) {
        weather.timestamp = time(NULL);
        weather.icon = icon_tuple->value->int8;
        weather.temp_cur = tempcur_tuple->value->int8;
        weather.temp_low = templow_tuple->value->int8;
        weather.temp_high = temphigh_tuple->value->int8;
        weather.failed = false;
        persist_write_data(PERSIST_KEY_WEATHER, &weather, sizeof(Weather));
        dirty = true;
        ask_for_weather_update = false;
    }
    if (dict_find(iter, MSG_KEY_WEATHER_FAILED)) {
        // retry early when weather update failed
        set_weather_timer(10);
        ask_for_weather_update = false;
        weather.failed = true;
    }

    if (dict_find(iter, MSG_KEY_JS_READY)) {
        js_ready = true;
    }
    if (dirty) {
        // make sure we update tick frequency if necessary
        subscribe_tick(true);
        layer_mark_dirty(layer_background);
    }
    if (ask_for_weather_update) {
        update_weather();
    }
}

/**
 * Read a value from the persistent storage (or load the default value).
 */
void read_config(const uint32_t key, uint8_t *value) {
    if (persist_exists(key)) {
        *value = persist_read_int(key);
    } else {
        persist_write_int(key, *value);
    }
}

/**
 * Read a value from the persistent storage (or load the default value).
 */
void read_config_2(const uint32_t key, uint16_t *value) {
    if (persist_exists(key)) {
        *value = persist_read_int(key);
    } else {
        persist_write_int(key, *value);
    }
}


/**
 * Read all items from the configuration storage.
 */
void read_config_all() {

// -- autogen
// -- ## for key in configuration
// -- ##   if not key["local"]
// --     read_config{% if key["type"] == "uint16_t" %}_2{% endif %}({{ key["key"] }}, &{{ key["key"] | lower }});
// -- ##   endif
// -- ## endfor
    read_config(CONFIG_VIBRATE_DISCONNECT, &config_vibrate_disconnect);
    read_config(CONFIG_VIBRATE_RECONNECT, &config_vibrate_reconnect);
    read_config(CONFIG_MESSAGE_DISCONNECT, &config_message_disconnect);
    read_config(CONFIG_MESSAGE_RECONNECT, &config_message_reconnect);
    read_config_2(CONFIG_WEATHER_REFRESH, &config_weather_refresh);
    read_config_2(CONFIG_WEATHER_EXPIRATION, &config_weather_expiration);
// -- end autogen

    if (persist_exists(PERSIST_KEY_WEATHER) && persist_get_size(PERSIST_KEY_WEATHER) == sizeof(Weather)) {
        Weather tmp;
        persist_read_data(PERSIST_KEY_WEATHER, &tmp, sizeof(Weather));
        // make sure we are reading weather info that's consistent with the current version number
        if (tmp.version == REDSHIFT_WEATHER_VERSION) {
            weather = tmp;
        } else {
            weather.timestamp = 0;
        }
    } else {
        weather.timestamp = 0;
    }

    js_ready = false;
}

# Graphite

Download at https://stefanheule.com/graphite/.

## Overview

See [stefanheule.com/graphite/](https://stefanheule.com/graphite/).

## Changelog

**Version 1.8** (2026-08-31)

- Temporary Fahrenheit learning mode: every temperature in the top row is drawn twice, Fahrenheit above Celsius, in a slightly taller top bar (the phone keeps sending the configured unit; Fahrenheit is derived on the watch).  Not configurable; meant to be removed once Fahrenheit feels natural.


**Version 1.7** (2026-08-29)

- Rain bars now show how hard it is expected to rain, not just the chance.  Bar height is the probability of precipitation scaled by the forecast amount: a full bar is near-certain solid rain (>= 4 mm/h), a sure drizzle shows a quarter-height bar, and providers that send no hourly amounts fall back to probability alone.  Previously "100% chance of drizzle" filled the bar exactly like a downpour, making a showery day look like heavy rain all day.
- Add Google Weather (Maps Platform Weather API) as a weather source.  Requires a Google Cloud API key with the Weather API enabled (10,000 free calls per month; Graphite uses roughly 6,000 at the default 30-minute refresh).  Supports everything: current conditions, low/high, sunrise/sunset, and the hourly rain bars (probability and amount).


**Version 1.6** (2026-05-03)

- Replace dead weather providers.  Dark Sky was retired in March 2023 and Weather Underground's free public API has been gone since 2018, so requests to both have been failing with 503 errors.  The provider list is now Open-Meteo (default, no API key required), OpenWeatherMap (One Call API 3.0, requires user key), and Weatherbit (requires user key).
    - Existing users at the default source will auto-migrate to Open-Meteo and keep working with no action needed.
    - Users who previously selected Dark Sky or Weather Underground will need to pick a new provider and supply a new API key.
    - Note: Weatherbit's free tier does not include the hourly forecast endpoint, so the rain bars stay empty when this provider is selected.
- Show the current location (city) where the rain bars normally are while secondary widgets are visible (i.e. for a few seconds after shaking your wrist).  The text is centered when it fits and left-aligned with right-side clipping otherwise.
    - Weatherbit: city name comes back in the existing weather response, no extra call.
    - OpenWeatherMap: uses the free Geocoding API in parallel with the weather call.
    - Open-Meteo: uses BigDataCloud's free reverse-geocode-client endpoint in parallel with the weather call (no API key required).
    - Geocoding requests are best-effort: if they fail, the watchface still shows weather and just falls back to rain bars after a shake.


**Version 1.5** (2021-10-04)

- Add support for hourly rain forcast from openweathermap.org.


**Version 1.4** (2020-02-18) (no version change, since only the config changed)

- Fix "Celsius" typo in config page.  Thanks @crazyquark.


**Version 1.4** (2017-05-11)

- Fix localized date issue.  Dates should show up in the local language again.


**Version 1.3** (2017-04-10)

- Secondary widgets: shake your watch for 6 additional widgets.
- Add sunrise/sunset widgets.
- Add phone battery widgets (only on Android).
- Add option to change accent color when in quiet mode.
- Improve usage of bluetooth.
- Size optimizations.
- UTC as an explicit option (available as of 2017-03-08 through server-side configuration page update).


**Version 1.2** (2017-03-04)

- Add up to 3 additional timezone widgets.
- Add a battery text widget (two versions, one with percent sign, one without).
- Add option for hourly vibration.
- Fix position of small icons in preview.


**Version 1.1** (2017-02-17)

- Fix position of small icons.


**Version 1.0** (2017-02-16)

- Initial version.


## Building from Source

To build the project in a release configuration, run

    ./configure
    make release

For development, you can build a debug build by running

    ./configure
    make build

### Versioning

The watchface itself uses relatively arbitrary version numbers of MAJOR.MINOR.  In addition to that, the configuration format (the JavaScript config object) is versioned, too, using a single integer.  Different version of the watchface may share the same configuration format.

| Watchface version | Configuration version |
|------------------:|----------------------:|
|     1.0 until 1.1 |                     1 |
|               1.2 |                     2 |
|     1.3 until 1.5 |                     3 |
|               1.6 |                     4 |
|     1.7 until now |                     5 |

## Contributing

Pull requests are welcome.

## License

Copyright 2016-2017 Stefan Heule

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


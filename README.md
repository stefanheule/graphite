# Graphite [![Build status](https://travis-ci.org/stefanheule/graphite.svg?branch=master)](https://travis-ci.org/stefanheule/graphite)

Available in the Pebble App Store:

[![Available on the Pebble App Store](http://pblweb.com/badge/xxxxx/black/small)](https://apps.getpebble.com/applications/xxxxx)

## Overview

## Screenshots

## FAQ

**No weather information is displayed**

There are many possible causes:

- Ensure that your phone is connected to the internet.
- If you use darksky.net or wunderground.com as a weather source, make sure the API key is correct.
- If you use a custom location, make sure it is a valid location.
- Make sure the color for the widget is different from the background color.

**What does it mean when the degree sign is missing for the weather?**

In this case, the last attempt to update the weather failed.  This can be for any number of reasons (see above).  Graphite will keep displaying the previous weather information until it expires.

## Changelog

**Version 1.0**

- Initial version

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
|               1.0 |                     1 |

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


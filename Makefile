
-include .redshift_config

ifndef DEFAULT_PLATFORM
$(error DEFAULT_PLATFORM is not set.  Did you run ./configure?)
endif

REDSHIFT_CONFIG=""
REDSHIFT_FILE="out"

REDSHIFT_PHONE_IP="192.168.1.6"

# platform
P=$(DEFAULT_PLATFORM)

VERSION=$(shell cat package.json | grep version | grep -o "[0-9][0-9]*\.[0-9][0-9]*")

all: build install_emulator

deploy: install_deploy

release:
	@status=$$(git status --porcelain -uno); \
	if test "x$${status}" = x; then \
		echo "Building version $(VERSION) in release mode."; \
	else \
		echo Working directory is dirty!  Commit all changes first; \
		exit 1; \
	fi
	@./configure --release > /dev/null
	@$(MAKE) clean > /dev/null
	@$(MAKE) build_quiet > /dev/null
	@./configure > /dev/null
	@rm -rf releases/$(VERSION)
	@mkdir -p releases/$(VERSION)
	@cp build/2016-redshift.pbw releases/$(VERSION)/redshift-$(VERSION).pbw
	@echo "git-version: $(shell git rev-parse HEAD)" >> releases/$(VERSION)/redshift-$(VERSION).meta.txt
	@echo "date: $(shell date +%Y-%m-%d) $(shell date +%H:%M:%S)" >> releases/$(VERSION)/redshift-$(VERSION).meta.txt
	@echo "Done, releases/$(VERSION)/redshift-$(VERSION).pbw is ready for upload."

build: initialize
	# copy fonts
	cp resources/fonts/nupe2.ttf config/fonts/nupe2.ttf
	cp resources/fonts/fasubset.ttf config/fonts/fasubset.ttf
	pebble build

initialize:
	scripts/initialize.py

build_quiet:
	@scripts/build_quiet.sh

config:
	pebble emu-app-config --emulator $(P)

log:
	pebble logs --emulator $(P)

travis_build:
	yes | ~/pebble-dev/${PEBBLE_SDK}/bin/pebble build

install_emulator:
	pebble install --emulator $(P)

install_deploy: build
	pebble install --phone $(REDSHIFT_PHONE_IP)

phone_log:
	pebble logs --phone $(REDSHIFT_PHONE_IP)

menu_icon:
	$(MAKE) write_header REDSHIFT_CONFIG="SCREENSHOT_MENU_ICON"
	$(MAKE) build
	$(MAKE) install_emulator
	$(MAKE) clean_header

resources:
	SUPPORTED_PLATFORMS=$(SUPPORTED_PLATFORMS) scripts/assemble_screenshots.sh

screenshots:
	scripts/screenshot_from_config.py

config_screenshots:
	rm -f screenshots/aplite/config.png
	rm -f screenshots/basalt/config.png
	rm -f screenshots/chalk/config.png
	phantomjs scripts/capture-settings-screenshot.js TODO?platform=chalk&version=$(VERSION)
	sleep 2
	pngcrush -q -rem time tmp.png screenshots/chalk/config.png
	rm tmp.png

single_screenshot: write_header build_quiet
	scripts/take_screenshot.sh $(REDSHIFT_FILE)

write_header:
	@echo "#define $(REDSHIFT_CONFIG)" > src/config.h

clean: clean_header
	pebble clean 2> /dev/null

clean_header:
	echo "" > src/config.h

updated_config:
	src/scripts/updated_config.sh

font_dl:
	./node_modules/fontello-cli/bin/fontello-cli install --config resources/fonts/fontello-config.json --font resources/fonts --css resources/fonts
	rm -rf resources/fonts/animation.css resources/fonts/fasubset-codes.css resources/fonts/fasubset-embedded.css resources/fonts/fasubset-ie7-codes.css resources/fonts/fasubset-ie7.css resources/fonts/fasubset.css resources/fonts/fasubset.eot resources/fonts/fasubset.woff resources/fonts/fasubset.woff2

font_build:
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[A-Ia-jz]" resources/fonts/nupe2.svg
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[0-9a-zA-Z.:\-/° ,]" resources/fonts/OpenSans-CondensedBold.svg
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "." resources/fonts/fasubset.svg

library_dl:
	wget http://momentjs.com/downloads/moment.min.js -O src/pkjs/moment.js
	wget http://momentjs.com/downloads/moment-timezone-with-data-2010-2020.min.js -O src/pkjs/moment-timezone.js

.PHONY: all deploy build build_quiet config log resources install_emulator install_deploy menu_icon screenshots screenshot screenshot_config write_header clean clean_header

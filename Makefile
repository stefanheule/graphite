
REDSHIFT_CONFIG=""
REDSHIFT_FILE="out"

# platform
P="emery"

VERSION=$(shell cat package.json | grep version | grep -o "[0-9]*\.[0-9]*")

all: build install_emulator

deploy: install_deploy

build:
	# copy fonts
	cp resources/fonts/nupe2.ttf config/fonts/nupe2.ttf
	pebble build

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
	pebble install --phone 192.168.1.6

menu_icon:
	$(MAKE) write_header REDSHIFT_CONFIG="SCREENSHOT_MENU_ICON"
	$(MAKE) build
	$(MAKE) install_emulator
	$(MAKE) clean_header

resources:
	scripts/assemble_resources.sh

screenshots: screenshot_config
	pebble kill
	$(MAKE) screenshot REDSHIFT_CONFIG="SCREENSHOT_MAIN" REDSHIFT_FILE="main"
	scripts/assemble_screenshots.sh
	scripts/assemble_resources.sh
	pebble kill

screenshot_config:
	rm -f screenshots/aplite/config.png
	rm -f screenshots/basalt/config.png
	rm -f screenshots/chalk/config.png
	phantomjs scripts/capture-settings-screenshot.js TODO?platform=chalk&version=$(VERSION)
	sleep 2
	pngcrush -q -rem time tmp.png screenshots/chalk/config.png
	rm tmp.png

screenshot: write_header build_quiet
	scripts/take_screenshot.sh $(REDSHIFT_FILE)

write_header:
	@echo "#define $(REDSHIFT_CONFIG)" > src/config.h

clean: clean_header
	pebble clean

clean_header:
	echo "" > src/config.h

updated_config:
	src/scripts/updated_config.sh

font_build:
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[A-Ia-jz]" resources/fonts/nupe2.svg
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[0-9a-zA-Z.:\-/° ,]" resources/fonts/OpenSans-CondensedBold.svg

.PHONY: all deploy build build_quiet config log resources install_emulator install_deploy menu_icon screenshots screenshot screenshot_config write_header clean clean_header

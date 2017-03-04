
-include .graphite_config

ifndef DEFAULT_PLATFORM
$(error DEFAULT_PLATFORM is not set.  Did you run ./configure?)
endif

GRAPHITE_CONFIG=""
GRAPHITE_FILE="out"

GRAPHITE_PHONE_IP="192.168.1.6"

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
	@cp build/2016-graphite.pbw releases/$(VERSION)/graphite-$(VERSION).pbw
	@echo "git-version: $(shell git rev-parse HEAD)" >> releases/$(VERSION)/graphite-$(VERSION).meta.txt
	@echo "date: $(shell date +%Y-%m-%d) $(shell date +%H:%M:%S)" >> releases/$(VERSION)/graphite-$(VERSION).meta.txt
	@echo "Done, releases/$(VERSION)/graphite-$(VERSION).pbw is ready for upload."

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

config_new_version:
	@read -p "New version number:" v; \
	git checkout -b config-$$v; \
	git push --set-upstream origin config-$$v; \
	git checkout master

update_timezones:
	wget -O tz.zip https://timezonedb.com/files/timezonedb.csv.zip
	rm -rf tz-data
	unzip tz.zip -d tz-data
	rm -rf tz.zip
	scripts/process_tz_data.py > tz-data/tz-select.html
	echo "Update the GRAPHITE_TZ_DATA_VERSION in src/graphite.h"

log:
	pebble logs --emulator $(P)

install_emulator:
	pebble install --emulator $(P)

install_deploy: build
	pebble install --phone $(GRAPHITE_PHONE_IP)

phone_log:
	pebble logs --phone $(GRAPHITE_PHONE_IP)

menu_icon:
	$(MAKE) write_header GRAPHITE_CONFIG="SCREENSHOT_MENU_ICON"
	$(MAKE) build
	$(MAKE) install_emulator
	$(MAKE) clean_header

resources:
	SUPPORTED_PLATFORMS=$(SUPPORTED_PLATFORMS) scripts/assemble_screenshots.sh

screenshots:
	scripts/screenshot_from_config.py
	SUPPORTED_PLATFORMS=$(SUPPORTED_PLATFORMS) scripts/assemble_screenshots.sh

single_screenshot: write_header build_quiet
	scripts/take_screenshot.sh $(GRAPHITE_FILE)

write_header:
	@echo "#define $(GRAPHITE_CONFIG)" > src/config.h

clean: clean_header
	pebble clean 2> /dev/null

clean_header:
	echo "" > src/config.h

updated_config:
	scripts/updated_config.sh

stats:
	@echo "Number of unique watches:"
	ssh linode "cat /home/stefan/www/pages/common/data/graphite/analytics.json | sed "s/,/\\\\n/g" | grep wtoken | sort | uniq | wc -l"

font_dl:
	./node_modules/fontello-cli/bin/fontello-cli install --config resources/fonts/fontello-config.json --font resources/fonts --css resources/fonts
	rm -rf resources/fonts/animation.css resources/fonts/fasubset-codes.css resources/fonts/fasubset-embedded.css resources/fonts/fasubset-ie7-codes.css resources/fonts/fasubset-ie7.css resources/fonts/fasubset.css resources/fonts/fasubset.eot resources/fonts/fasubset.woff resources/fonts/fasubset.woff2

font_build:
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[ABabdfghij]" resources/fonts/nupe2.svg
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "[0-9a-zA-Z.:\-/° ,]" resources/fonts/OpenSans-CondensedBold.svg
	node_modules/pebble-fctx-compiler/fctx-compiler.js -r "." resources/fonts/fasubset.svg

library_dl:
	wget http://momentjs.com/downloads/moment.min.js -O src/pkjs/moment.js
	wget http://momentjs.com/downloads/moment-timezone-with-data-2010-2020.min.js -O src/pkjs/moment-timezone.js

coverity_scan:
	make clean
	~/software/cov-analysis-linux64-8.7.0/bin/cov-configure --comptype gcc --compiler arm-none-eabi-gcc --template
	~/software/cov-analysis-linux64-8.7.0/bin/cov-build --dir cov-int make build
	rm -f graphite-coverity.tgz
	tar czf graphite-coverity.tgz cov-int
	rm -rf cov-int
	curl --form token=_-37pwMfnnG1HrgX1_KnYg \
      --form email=stefanheule@gmail.com \
      --form file=@graphite-coverity.tgz \
      --form version="git hash `git rev-parse HEAD`" \
      --form description="Automatic submission from Makefile" \
      https://scan.coverity.com/builds?project=stefanheule%2Fgraphite
	rm -f graphite-coverity.tgz

.PHONY: all deploy build build_quiet config log resources install_emulator install_deploy menu_icon screenshots screenshot screenshot_config write_header clean clean_header

# Agent instructions

Graphite is Stefan's Pebble watchface: a Pebble SDK C app (`src/`), a PebbleKit
JS half (`src/pkjs/`) and a web config page (`config/`), built with `pebble
build` for `basalt` and `emery`. `DEVELOPER.md` describes the build and the
Jinja template system; this file is about getting a build onto the watch.

## Putting a build on the watch

**Run `make publish`** (`scripts/release.sh`). It builds a clean release
`.pbw` and hands it to `orbit/scripts/publish-pebble-app.sh` in the `core`
checkout (`~/dev/core`, or `CORE_DIR`), which signs a manifest with Orbit's
update key, uploads both to `downloads.terra0.com/graphite/`, and sends a
`pebble_app_update` command through the notify hub. Orbit on the phone
downloads and verifies the bundle and gives it to the Core Devices Pebble app,
which sideloads it onto the watch without asking. Nothing is typed or tapped;
the watchface is running about a minute later. `--local` builds and signs
without uploading, `--no-push` uploads without telling the phone.

The version is read from the bundle's `appinfo.json`, which comes from
`version` in `scripts/initialize.py` through `package.template.json`. Orbit
skips a release whose version code is not higher than the last one it handed
over, so **bump the version before publishing** or the phone ignores it. A
Pebble version is two numbers each at most 255 (`1.6`); the code is
`major * 1000 + minor`.

Two things that look like shipping are not:

- `make install-phone` pushes over the Pebble developer connection
  (`pebble install --phone 10.0.0.5`), which only works while Developer
  Connection is switched on in the Pebble app. It is for iterating, not for
  leaving something on the watch.
- `make release` archives a build under `releases/<version>/` for the public
  download on stefanheule.com. It does not touch the watch.

The app UUID `7e5267ac-798f-4953-a645-1b87a5c29d96` appears in
`package.template.json`, `scripts/release.sh`, and Orbit's `ManagedPebbleApps`
registry; the publisher and Orbit both refuse a bundle whose `appinfo.json`
carries a different one. Do not change it.

#!/usr/bin/env bash

set -euo pipefail

# Builds a release of the watchface and puts it on Stefan's watch.
#
# Bump `version` in scripts/initialize.py first. This builds a clean release
# .pbw and hands it to orbit/scripts/publish-pebble-app.sh in the core
# checkout, which signs a manifest with Orbit's update key, uploads both to
# downloads.terra0.com/graphite/, and tells the phone through the notify hub.
# Orbit downloads and verifies the bundle and gives it to the Core Devices
# Pebble app, which sideloads it onto the watch without asking — the watchface
# is running about a minute after this script ends.
#
# This is the way to ship a change to the watch. `make install-phone` still
# exists for iterating over the developer connection, and `make release` still
# archives a build under releases/ for the public download on the website;
# neither of those reaches the watch on its own.
#
#   --local    build and sign only, no upload and no push
#   --no-push  upload, but do not tell the phone to install now

readonly here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly core_dir="${CORE_DIR:-${HOME}/dev/core}"
readonly publish="${core_dir}/orbit/scripts/publish-pebble-app.sh"

# Must match `uuid` in package.template.json; publish-pebble-app.sh refuses a
# bundle whose appinfo.json says otherwise, and so does Orbit.
readonly uuid="7e5267ac-798f-4953-a645-1b87a5c29d96"

for arg in "$@"; do
  case "${arg}" in
    --local | --no-push) ;;
    *)
      echo "Unknown option: ${arg}" >&2
      exit 1
      ;;
  esac
done

if [[ ! -x "${publish}" ]]; then
  echo "No core checkout at ${core_dir} (looked for ${publish})." >&2
  echo "The manifest is signed with Orbit's update key, so publishing needs it." >&2
  echo "Set CORE_DIR if it lives somewhere else." >&2
  exit 1
fi

cd "${here}"
if [[ ! -f .graphite_config ]]; then
  echo "Run ./configure once first." >&2
  exit 1
fi

# scripts/initialize.py needs jinja2, and `python3` on this Mac has drifted to a
# Homebrew interpreter without it while the system one still has it. Rather
# than installing into an externally-managed Python, put whichever interpreter
# can import jinja2 first on PATH for the build.
if ! python3 -c 'import jinja2' 2>/dev/null; then
  shim=""
  for candidate in /usr/bin/python3 /opt/homebrew/bin/python3 /usr/local/bin/python3; do
    if [[ -x "${candidate}" ]] && "${candidate}" -c 'import jinja2' 2>/dev/null; then
      shim="$(mktemp -d)"
      ln -s "${candidate}" "${shim}/python3"
      export PATH="${shim}:${PATH}"
      echo "Using ${candidate} for the build (the default python3 has no jinja2)."
      break
    fi
  done
  if [[ -z "${shim}" ]]; then
    echo "No python3 with jinja2 found; scripts/initialize.py needs it." >&2
    exit 1
  fi
  trap 'rm -rf "${shim}"' EXIT
fi

# A clean release build: reconfigures for --release, cleans, builds, and puts
# the debug configuration back, leaving the release bundle in build/.
make build_release

if [[ ! -f build/graphite.pbw ]]; then
  echo "Expected build/graphite.pbw after the build." >&2
  exit 1
fi

exec "${publish}" build/graphite.pbw --uuid "${uuid}" --dir graphite "$@"

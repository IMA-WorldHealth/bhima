#!/bin/bash

# bash script mode
set -euo pipefail

trap 'kill $(jobs -p)' EXIT

echo "Building Test Databases"

./sh/build-database.sh || { echo 'failed to build DB' ; exit 1; }

echo "[test]"

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

echo "[test] Spawning server process..."
# build and start the server
./node_modules/.bin/gulp build
cd bin
node server/app.js &

echo "[test] Spawned node process."

echo "[test] Sleeping for $TIMEOUT seconds."
sleep "$TIMEOUT"

echo "[test] Running tests using protractor."
../node_modules/.bin/protractor ../protractor.conf.js

echo "[/test]"

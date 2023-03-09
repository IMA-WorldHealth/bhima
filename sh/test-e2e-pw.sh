#!/bin/bash

echo "Running the end-to-end tests using playwright"

# bash script mode
set -euo pipefail

trap 'kill $(jobs -p)' EXIT

echo "Building Test Databases"

./sh/build-database.sh || { echo 'failed to build DB' ; exit 1; }

echo "[test]"

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-5}

echo "[test] Spawning server process..."
# build and start the server
./node_modules/.bin/gulp build
cd bin
node server/app.js &

echo "[test] Spawned node process."

echo "[test] Sleeping for $TIMEOUT seconds."
sleep "$TIMEOUT"

echo "[test] Running end-to-end tests using playwright."
cd ..
npx playwright test

echo "[/test]"

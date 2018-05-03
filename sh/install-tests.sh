#!/bin/bash

# bash script mode
set -euo pipefail

trap 'kill $(jobs -p)' EXIT

set -a
source .env.development
set +a

./sh/build-init-database.sh

echo "[install test]"

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

echo "[install test] Spawning server process..."
# build and start the server
./node_modules/.bin/gulp build
cd bin
node server/app.js &
NODE_PID=$!

echo "[install test] Spawned node process $NODE_PID."

# make sure we have enough time for the server to start
echo "[install test] Sleeping for $TIMEOUT seconds."
sleep $TIMEOUT

echo "[install test] running tests using mocha"

# run the tests
../node_modules/.bin/mocha --recursive ../test/integration-install

echo "[install test] cleaning up node process $NODE_PID."

echo "[/install test]"

#!/bin/bash

# bash script mode
set -euo pipefail

set -a
source .env.development
set +a

./sh/build-database.sh

echo "[test]"

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

echo "[test] Spawning server process..."
# build and start the server
./node_modules/.bin/gulp build
cd bin
node server/app.js &
NODE_PID=$!

echo "[test] Spawned node process $NODE_PID."

# make sure we have enough time for the server to start
echo "[test] Sleeping for $TIMEOUT seconds."
sleep $TIMEOUT

echo "[test] running tests using mocha"
# run the tests
../node_modules/.bin/mocha --recursive ../test/integration/

echo "[test] cleaning up node process $NODE_PID."

# kill the server
kill $NODE_PID

echo "[/test]"

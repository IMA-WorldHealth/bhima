#!/bin/bash

# bash script mode
set -euo pipefail

trap 'kill $(jobs -p)' EXIT

echo "Building Test Databases"

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
echo "PID is: $NODE_PID"
echo ""
echo "process: $(ps aux | grep $NODE_PID | head -n 1)"
echo ""

echo "[test] Spawned node process."

echo "[test] Sleeping for $TIMEOUT seconds."
sleep "$TIMEOUT"

echo "[test] Running tests using protractor."
../node_modules/.bin/protractor ../protractor.conf.js

# kill process if exists
echo "[test] checking to see if node process exists"
if ps -p $NODE_PID > /dev/null; then
  echo "[test] killing node process"
  kill -9 $NODE_PID
  echo "[test] killed node process $NODE_PID"
fi

echo "[/test]"

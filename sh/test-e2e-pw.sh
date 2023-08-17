#!/bin/bash

echo ""
echo "==============================================="
echo "Running the end-to-end tests using playwright"
echo "==============================================="
echo ""

# bash script mode
set -euo pipefail

# Kill the BHIMA server when the test is finished
trap 'jobs -p | xargs -r kill' EXIT

echo "Building Test Databases"

./sh/build-database.sh || { echo 'failed to build DB' ; exit 1; }

echo "[test]"

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-5}

echo "[test] Spawning BHIMA server process..."

# build and start the server
./node_modules/.bin/gulp build
cd bin
node server/app.js &

echo "[test] Spawned node process."

echo "[test] Sleeping for $TIMEOUT seconds."
sleep "$TIMEOUT"

echo "[test] Running end-to-end tests using playwright (without stock tests)."
cd ..
npx playwright test 2>&1 | tee ./test/end-to-end-playwright/report

# FYI: Use --workers=1  to limit number of workers

# Clean up any left-over zombie node processes
procs=`netstat -tulpn |& grep 8080`
proc=`echo $procs | sed -r 's/.* ([0-9]+)\/node$/\1/g'`

if [[ ! -z "$proc" ]]
then
    echo "Deleting zombie node Bhima process $proc"
    kill -9 $proc
fi

echo "[/test]"

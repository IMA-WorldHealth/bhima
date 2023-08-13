#!/bin/bash

# bash strict mode
set -euo pipefail

./sh/build-database.sh || { echo 'failed to build DB' ; exit 1; }

echo "[test]"

echo "[test] building the server..."
# build the server
./node_modules/.bin/gulp build

echo "[test] running tests using mocha"
# run the tests
./node_modules/.bin/mocha --recursive --bail --exit --timeout 20000 ./test/integration/ 2>&1 | tee ./test/integration/report

echo "[/test]"

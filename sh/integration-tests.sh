#!/bin/bash

# bash script mode
set -euo pipefail

set -a
source .env.development
set +a

./sh/build-database.sh || { echo 'failed to build DB' ; exit 1; }

echo "[test]"

echo "[test] Spawning server process..."
# build the server
./node_modules/.bin/gulp build

echo "[test] running tests using mocha"
# run the tests
./node_modules/.bin/mocha --recursive --bail --exit ./test/integration/

echo "[/test]"

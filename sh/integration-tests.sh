#!/bin/bash

# bash script mode
set -euo pipefail

trap 'kill $(jobs -p)' EXIT

set -a
source .env.development
set +a

./sh/build-database.sh

echo "[test]"

echo "[test] Spawning server process..."
# build the server
./node_modules/.bin/gulp build

echo "[test] running tests using mocha"
# run the tests
NODE_ENV=development ./node_modules/.bin/mocha --recursive --bail ./test/integration/

echo "[/test]"

#!/bin/bash

# bash script mode
set -eo pipefail

function startfold {
  if [ -n "$TRAVIS_BUILD_NUMBER" ]; then
    echo $1
    echo -en "travis_fold:start:$2\r"
  fi
}

function endfold {
  if [ -n "$TRAVIS_BUILD_NUMBER" ]; then
    echo -en "travis_fold:end:$1\r"
  fi
}

# run karma (client unit) tests
startfold "Running Client Unit Tests..." "test-client-unit";
./node_modules/.bin/karma start --single-run --no-auto-watch --concurrency 1 karma.conf.js
endfold "test-client-unit" ;

# run integration tests
startfold "Running Integration Tests..." "test-integration";
./sh/integration-tests.sh
endfold "test-integration" ;

#run server-unit test
startfold "Running server Unit Tests ......" "server-unit"
./node_modules/.bin/mocha --recursive --exit test/server-unit
endfold "server-unit" ;

# run end to end tests
startfold "Running Client End to End Tests..." "test-end-to-end";
./sh/test-ends.sh
endfold "test-end-to-end" ;

exit 0;

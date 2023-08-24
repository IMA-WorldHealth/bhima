#!/bin/bash

# bash script mode
set -eo pipefail

# get DB settings
set -a
source .env || { echo '[test.sh] did not load .env, using variables from environment.' ; }
set +a

function startfold {
  echo
  echo "----------------------------------------------------------------------"
  echo $1
  echo
  if [ -n "$TRAVIS_BUILD_NUMBER" ]; then
    echo -en "travis_fold:start:$2\r"
  fi
}

function endfold {
  if [ -n "$TRAVIS_BUILD_NUMBER" ]; then
    echo -en "travis_fold:end:$1\r"
  fi
}

SUITE=${SUITE:-"ALL"}

# run karma (client unit) tests
if [ $SUITE = "client-unit" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Client Unit Tests..." "test-client-unit";
  ./node_modules/.bin/karma start --single-run --no-auto-watch karma.conf.js 2>&1 | tee ./test/client-unit/report
  endfold "test-client-unit" ;
fi

# run integration tests
if [ $SUITE = "integration" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Integration Tests..." "test-integration";
  ./sh/integration-tests.sh
  endfold "test-integration" ;
fi

# run server-unit test
if [ $SUITE = "server-unit" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running server Unit Tests ......" "server-unit"
  ./node_modules/.bin/mocha --recursive --exit test/server-unit 2>&1 | tee ./test/server-unit/report
  endfold "server-unit" ;
fi

if [ $SUITE = "integration-stock" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Stock Integration Tests..." "test-stock-integration";
  ./sh/integration-stock-tests.sh
  endfold "test-stock-integration" ;
fi

# # run end to end stock tests with Playwright
# if [ $SUITE = "end-to-end-stock" ] || [ $SUITE = "ALL" ] ; then
#   startfold "Running Stock End to End Tests..." "test-end-to-end-stock";
#   ./sh/test-e2e-pw-stock.sh
#   endfold "test-end-to-end-stock" ;
# fi

# # run end to end tests with Playwright
# if [ $SUITE = "end-to-end" ] || [ $SUITE = "ALL" ] ; then
#   startfold "Running End to End Tests (except stock tests)..." "test-end-to-end";
#   ./sh/test-e2e-pw.sh
#   endfold "test-end-to-end" ;
# fi

# Show summary of results
./sh/test-show-results.sh

exit 0;

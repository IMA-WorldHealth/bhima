#!/bin/bash

# bash strict mode
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

# run end to end account tests with Playwright
if [ $SUITE = "end-to-end-account" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running account End to End Tests..." "test-end-to-end-account";
  ./sh/test-e2e-pw-account.sh
  endfold "test-end-to-end-account" ;
fi

# run end to end stock tests with Playwright
if [ $SUITE = "end-to-end-stock" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Stock End to End Tests..." "test-end-to-end-stock";
  ./sh/test-e2e-pw-stock.sh
  endfold "test-end-to-end-stock" ;
fi

# run the rest of end to end tests with Playwright
if [ $SUITE = "end-to-end" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running End to End Tests (except stock tests)..." "test-end-to-end";
  ./sh/test-e2e-pw.sh
  endfold "test-end-to-end" ;
fi

# Show summary of results
./sh/test-show-results.sh

exit 0;

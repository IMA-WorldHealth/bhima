#!/bin/bash

# bash strict mode
set -eo pipefail

# Make sure results directory exists
if [[ ! -d results ]]; then
  echo "Creating 'results' directory"
  mkdir results
fi

# Delete any zombie server processes
procs=`netstat -tulpn |& grep 8080` || true
proc=`echo $procs | sed -r 's/.* ([0-9]+)\/node$/\1/g'`
if [[ ! -z "$proc" ]]
then
    echo "Deleting zombie node Bhima process $proc"
    kill -9 $proc
fi

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
  KARMA_FILENAME="client-unit-report.xml" ./node_modules/.bin/karma start karma.conf.js --single-run --no-auto-watch 2>&1 | tee ./results/client-unit-report
  endfold "test-client-unit" ;
fi

# run server-unit test
if [ $SUITE = "server-unit" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running server Unit Tests ......" "server-unit"
  ./sh/server-unit-tests.sh
  endfold "server-unit" ;
fi

# run integration tests
if [ $SUITE = "integration" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Integration Tests..." "test-integration";
  ./sh/integration-tests.sh
  endfold "test-integration" ;
fi

if [ $SUITE = "integration-stock" ] || [ $SUITE = "ALL" ] ; then
  startfold "Running Stock Integration Tests..." "test-stock-integration";
  ./sh/integration-stock-tests.sh
  endfold "test-stock-integration" ;
fi

# Show summary of results
./sh/test-show-results.sh

exit 0;

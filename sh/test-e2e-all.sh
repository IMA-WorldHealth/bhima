#!/bin/bash

# bash strict mode
set +e
set -o pipefail

# Make sure results directory exists
if [[ ! -d results ]]; then
  echo "Creating 'results' directory"
  mkdir results
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
}

# function endfold {
#   if [ -n "$TRAVIS_BUILD_NUMBER" ]; then
#     echo -en "travis_fold:end:$1\r"
#   fi
# }

SUITE=${SUITE:-"ALL"}

# run end to end account tests with Playwright
for i in {1..8}; do
  date
  startfold "Running account End to End Tests $i ...";
  npm run test:e2e-$i
  # endfold "test-end-to-end-$i" ;
done
date

# Show summary of results
./sh/test-show-results.sh

exit 0;

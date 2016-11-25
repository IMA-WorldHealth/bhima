#!/bin/bash

# bash script mode
set -uo pipefail

# This assumes you run tests from the top level bhima directory.

echo "Building test database for end to end tests ..."

# build the test database
# TODO Seperate test databases for integration (very few entities) and e2e tests (more featured) should be defined
DB_USER="bhima"
DB_PASS="HISCongo2013"
DB_NAME="bhima_test"

# set the build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE bhima_test;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE bhima_test;"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/bhima.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql

echo "Building server ...."

# build and start the server
./node_modules/.bin/gulp build
cd bin
NODE_ENV=development node server/app.js &
NODE_PID=$!

# make sure we have enough time for the server to start
echo "Sleeping for $TIMEOUT seconds"
sleep $TIMEOUT

echo "Running tests using protractor."
../node_modules/.bin/protractor ../protractor.conf.js

echo "Cleaning up node instances ..."

# kill the server
kill $NODE_PID

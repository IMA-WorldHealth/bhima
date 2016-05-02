#!/bin/bash

# bash script mode
set -euo pipefail

# This assumes you run tests from the top level bhima directory.

echo "Building test database for integration tests ..."

# TODO - store these in environmental variables somehow
DB_USER='bhima'
DB_PASS='HISCongo2013'
DB_NAME='bhima_test'

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

# build the test database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql

echo "Building server ...."

# build and start the server
./node_modules/.bin/gulp build
cd bin
NODE_ENV=development node server/app.js &
NODE_PID=$!

# make sure we have enough time for the server to start
sleep $TIMEOUT

echo "Running tests ..."

# run the tests
mocha server/test/api/

echo "Cleaning up test instance"

# kill the server
kill $NODE_PID

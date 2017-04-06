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

# build the test database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;"

echo "Building schema"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
echo "Building triggers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql
echo "Building functions and procedures"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/admin.sql
echo "Building test database"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/icd10.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql

mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeEntityMap();"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeDocumentMap();"


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

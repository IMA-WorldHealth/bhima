#!/bin/bash

# This assumes you run tests from the top level bhima directory.

echo "Building test database for end to end tests ..."

# build the test database
# TODO Seperate test databases for integration (very few entities) and e2e tests (more featured) should be defined
DB_USER="bhima"
DB_PASS="HISCongo2013"
DB_NAME="bhima_test"

mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE bhima_test;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE bhima_test;"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql

echo "Building server ...."

# build and start the server
npm run dev &

# make sure we have enough time for the server to start
sleep 8

echo "Running tests ..."

# FIXME Remove combination of gulp and shell scripts favouring one or the other
gulp client-test-e2e

echo "Cleaning up node instances ..."

# kill the server (and all other matching processes)
killall node

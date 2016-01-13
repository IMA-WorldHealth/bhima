#!/bin/bash

# This assumes you run tests from the top level bhima directory.

echo "Building test database for end to end tests ..."

# build the test database
# TODO Seperate test databases for integration (very few entities) and e2e tests (more featured) should be defined
user="bhima"
pw="HISCongo2013"

mysql -u $user -p$pw -e "DROP DATABASE bhima_test;"
mysql -u $user -p$pw -e "CREATE DATABASE bhima_test;"
#mysql -u $user -p$pw -e "GRANT ALL ON bhima_test.* TO 'bhima'@'localhost' IDENTIFIED BY 'HISCongo2013';"
mysql -u $user -p$pw bhima_test < server/models/schema.sql
mysql -u $user -p$pw bhima_test < server/models/test/data.sql
mysql -u $user -p$pw bhima_test < server/models/updates/synt.sql


echo "Building server ...."

# build and start the server
npm run dev &

# make sure we have enough time for the server to start
sleep 5

echo "Running tests ..."

# FIXME Remove combination of gulp and shell scripts favouring one or the other
gulp client-test-e2e

echo "Cleaning up node instances ..."

# kill the server (and all other matching processes)
killall node

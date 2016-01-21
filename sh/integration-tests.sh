#!/bin/bash

# This assumes you run tests from the top level bhima directory.

echo "Building test database for integration tests ..."

# TODO - store these in environmental variables somehow
user="bhima"
pw="HISCongo2013"

# build the test database
mysql -u $user -p$pw -e "DROP DATABASE IF EXISTS bhima_test;"
mysql -u $user -p$pw -e "CREATE DATABASE bhima_test CHARACTER SET utf8 COLLATE utf8_unicode_ci;"

# mysql -u $user -p$pw -e "GRANT ALL ON bhima_test.* TO 'bhima'@'localhost' IDENTIFIED BY 'HISCongo2013';"
mysql -u $user -p$pw bhima_test < server/models/schema.sql
mysql -u $user -p$pw bhima_test < server/models/test/data.sql
mysql -u $user -p$pw bhima_test < server/models/updates/synt.sql


echo "Building server ...."

# build and start the server
npm run dev &

# make sure we have enough time for the server to start
sleep 5

echo "Running tests ..."

# run the tests
mocha server/test/api/

echo "Cleaning up node instances ..."

# kill the server (and all other matching processes)
killall node

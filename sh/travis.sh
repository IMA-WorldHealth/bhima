#!/bin/bash

# Instructions for Travis to build the MySQL database
# NOTE - the bhima user is already defined in the .travis.yml

# echo "[LOG] Building the database ..."
# 
# # build the test database
# DB_USER='bhima_travis'
# DB_PASS='t3STP@$$_TRAVIS'
# DB_NAME='bhima_travis_db'
# 
# # build the test database
# mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
# mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql
# mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/updates/synt.sql

echo "[LOG] Building and running server in test mode ..."

# build and start the server
npm run travis &

# make sure we have enough time for the server to start
sleep 10

echo "[LOG] Running integration tests."

# run the tests
mocha server/test/api/

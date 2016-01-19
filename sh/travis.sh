#!/bin/bash

# This file runs some lint checks using Travis CI

# lint the client
echo "[LOG] Linting the client ..."
gulp lint

# build the application
echo "[LOG] Building the application ..."
gulp build

# lint the server
echo "[LOG] Linting the server ..."
jshint server/{controllers,lib,config}/*.js
jshint server/controllers/{categorised,medical,reports,stock,finance}/*.js

# Instructions for Travis to build the MySQL database
# NOTE - the bhima user is already defined in the .travis.yml

echo "[LOG] Building the database ..."

user="bhima"
pw="HISCongo2013"

# build the test database
mysql -u $user -p$pw -e "DROP DATABASE IF EXISTS bhima_test;"
mysql -u $user -p$pw -e "CREATE DATABASE bhima_test CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
mysql -u $user -p$pw bhima_test < server/models/schema.sql
mysql -u $user -p$pw bhima_test < server/models/test/data.sql
mysql -u $user -p$pw bhima_test < server/models/updates/synt.sql

echo "[LOG] Building and running server in development mode ..."

# build and start the server
npm run dev &

# make sure we have enough time for the server to start
sleep 10

echo "[LOG] Running integration tests."

# run the tests
mocha server/test/api/

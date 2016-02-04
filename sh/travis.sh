#!/bin/bash

# Instructions for Travis to build the MySQL database
# NOTE - the bhima user is already defined in the .travis.yml

echo "[TRAVIS] Linting the client."
gulp lint

echo "[TRAVIS] Linting the server."
find server/ \( -not -wholename '*/test/*' -name '*.js' \) -exec jshint {} \;

echo "[LOG] Building and running server in test mode ..."

# build and start the server
npm run travis &

# make sure we have enough time for the server to start
sleep 10

echo "[TRAVIS] Running integration tests..."

# run the integration tests
mocha server/test/api/

echo "[TRAVIS] Running end to end tests..."

# run end to end tests
gulp client-test-e2e

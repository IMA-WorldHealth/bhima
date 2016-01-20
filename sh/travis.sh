#!/bin/bash

# This file runs some lint checks using Travis CI

# lint the client
echo "Linting the client ..."
gulp lint

# build the application
echo "Building the application ..."
gulp build

# lint the server
echo "Linting the server ..."
jshint server/{controllers,lib,config}/*.js
jshint server/controllers/{categorised,medical,reports,stock,finance}/*.js

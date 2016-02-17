#!/bin/bash

# post install script to deploy the application for testing

export NODE_ENV="staging"

# setup nodejs dependencies
npm install

# update dependencies
./node_modules/.bin/bower install

# build the application
./node_modules/.bin/gulp build

# cd into the built directory
cd bin

# start the application
node server/app.js &

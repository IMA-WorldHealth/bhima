#!/bin/bash

# post install script to deploy the application for testing

export NODE_ENV="staging"

# remove the progress bar for fun and profit
npm set progress=false

# make sure we have the latest version of npm
npm install -g npm

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

#!/bin/bash

# post install script to deploy the application for testing
NODE_ENV="production"

# remove the progress bar for fun and profit
npm set progress=false

# setup nodejs dependencies
npm install

# update dependencies
./node_modules/.bin/bower install --quiet

# build the application
./node_modules/.bin/gulp build

# cd into the built directory
cd bin

export NODE_ENV="staging"

# start the application
node server/app.js &

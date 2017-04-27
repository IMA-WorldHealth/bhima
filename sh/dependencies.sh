##
## Install the node/client dependencies
##

# remove the progress bar to speed things up and make logs clearer
npm set progress=false

# setup node dependencies
npm install npm --quiet
npm install --quiet
./node_modules/.bin/bower install --quiet
./node_modules/.bin/gulp build
./node_modules/.bin/webdriver-manager update

# cd into the built directory
cd bin

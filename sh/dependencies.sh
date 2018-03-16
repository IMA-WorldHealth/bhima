##
## Install the node/client dependencies
##

yarn install

./node_modules/.bin/bower install --quiet
./node_modules/.bin/gulp build
./node_modules/.bin/webdriver-manager update --gecko false

# cd into the built directory
cd bin

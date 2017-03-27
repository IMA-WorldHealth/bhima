Bhima Installation Guide
===========================

*NOTE* This guide is built for bhima version 2.X.  If you are attempting to build version 1.X, see [this repository](https://github.com/IMA-WorldHealth/bhima-1.X).

This guide will get you up and running with bhima locally.  Please note that bhima is under active development and should *not* be used commercially.  If you are interested in development progress, shoot us a line at <developers@imaworldhealth.org>.

###### Dependencies
Before you begin the installation process, please make sure you have all the bhima dependencies installed locally.  We only test on Linux, so your best bet is to use a Linux you are familiar with.  Please make sure you have recent version of:
 1. [MySQL](http://dev.mysql.com/downloads/) (5.6 or greater)
 2. [Redis](redis.io)
 3. [NodeJS](https://nodejs.org/en/) (we recommend using [node version manager](https://github.com/creationix/nvm)).
 4. [WKHTMLtoPDF](http://wkhtmltopdf.org/downloads.html)


###### Getting the source
Clone the source using git from the [bhima github repository] (https://github.com/IMA-WorldHealth/bhima-2.x).

```bash
git clone https://github.com/IMA-WorldHealth/bhima-2.X.git bhima-2.X
cd bhima-2.X
```

###### Building from source
We use the [gulpjs](http://www.gulpjs.com) build tool to build from source, installed with `npm`.

```bash
# Inside the bhima-2.X/ directory

# install all node modules
npm install --no-progress --loglevel http

# install client-side dependencies with bower
./node_modules/.bin/bower install -f

# build the application
npm run build
```

###### Creating a database
The database structure is contained in the following files:
 1. `server/models/*.sql`

For an initial setup, bhima also includes a file `server/models/test/data.sql` that contains sample data to get the application up and running rapidly.  Build all three and customize further from within the running application.  Note that the database must be running SQL strict mode for all the logic to behave correctly.

Alternative, you might use the `build-database.sh` script, customized with your environmental variables as shown below:

```sh
# install the database
DB_USER='me' DB_PASS='MyPassword' DB_NAME='bhima' ./sh/build-database.sh
```

###### Configuring the Application
The development data is bundled with the application.
Copy the `.env.sample` environmental variable file into `.env.production` and set your preferred environmental variables where required.  Make sure this file is in the root directory.

###### Running the Application
Running the application is super easy!  Just type `npm run app` in the application root directory.  Alternatively, you can run the development version using `npm run dev`.

###### Verify the Install
Navigate to [https://localhost:8080](https://localhost:8080) in the browser to verify the installation.  You should be greeted with a login page.

###### Testing the Application
Our tests are broken into unit tests, end to end tests, and integration tests.  There is more information on testing in the [wiki](https://github.com/IMA-WorldHealth/bhima-2.X/wiki).
 1. **Integration Tests** - These test the server + database integration and generally our APIs.  All reachable API endpoints should generally have an integration test associated with them.  To run them, type `npm run test:integration`.
 2. **Unit Tests** - Client components are unit tested with karma which you should have installed if you installed all dependencies.  Karma launches a chrome browser to execute the tests.  To run them, type `npm run test:client-unit`.
 3. **End to End Tests** - The entire stack is tested with (often flaky) end to end tests using [protractor](protractortest.org).  Protractor depends on `webdriver-manager` which must be installed separately.  See their documentation for more information.  The end to end tests can be run with `npm run test:ends`.

You can run all tests by simply typing `npm run test`.

Enjoy using bhima!

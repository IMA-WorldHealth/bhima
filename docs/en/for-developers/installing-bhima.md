# Installing BHIMA

The BHIMA software can be complex to install.  We only officially support Linux, so the following guide assumes you are setting up BHIMA on Debian-based Linux environment.

This guide will get you up and running with bhima locally. Please note that bhima is under active development and tends to move fast and break things. If you are interested in development progress, shoot us a line at [developers@imaworldhealth.org](mailto:developers@imaworldhealth.org).

### Dependencies

Before you begin the installation process, please make sure you have all the bhima dependencies installed locally. We only test on Linux, so your best bet is to use a Linux flavor you are familiar with. Please make sure you have recent version of:

1. [MySQL](http://dev.mysql.com/downloads/) \(5.6 or newer\)
2. [Redis](https://redis.io)
3. [curl](https://curl.haxx.se/)
4. [NodeJS](https://nodejs.org/en/) \(we recommend using [node version manager](https://github.com/creationix/nvm) on linux. Note that we only test on stable and edge\).
5. [yarn](https://yarnpkg.com/)
6. [git](https://git-scm.com/downloads)

### Detailed dependency installation instructions for Ubuntu \(verified / installed specifically using VirtualBox\)

```bash
#Run the following command to update the package lists:
sudo apt-get update

#Install MySQL with the following command:
sudo apt-get install mysql-server

#Run the following commands to install Redis:
sudo apt-get install redis-server

#Run the following commands to install curl:
sudo apt-get install curl

#Install node version manager locally
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

#Set up the environmental variables for node version manager
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \."$NVM_DIR\nvm.sh" # This loads nvm

#Download NodeJS latest long-term version
nvm install lts/*

#Installs yarn without re-installing NodeJS
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn --no-install-recommends

#Run the following command to install git:
sudo apt-get install git
```

### Getting the source

Clone the source using git from the [github repository](https://github.com/IMA-WorldHealth/bhima) using the following commands:

```bash
git clone https://github.com/IMA-WorldHealth/bhima.git bhima
cd bhima
```

### Building from source

All our build scripts are found the `package.json` file. We use [gulpjs](http://www.gulpjs.com) internally, but you shouldn't ever need to call gulp explicitly.

To execute the build scripts, you can use either `yarn` or `npm`. We'll use `yarn` for the remainder of this guide. Note that using `npm` may require you to use `npm run` where it says `yarn` below.

```bash
# Inside the bhima/ directory
# install all node modules

yarn install

#If this command gives you an error (I.E. if you’re running Parallels), try running the following command:
git config -global url."https://".insteadOf git://
```

The dependencies should now be set!

BHIMA uses environmental variables to connect to the database and toggle features. These are found in the `.env.development` file included in the top level of the repository. By default, the build script will copy all files named `.env.*` into the build folder `bin/` when building the application. At runtime, the file corresponding to `.env.$NODE_ENV` will be used to configure the application. For the default node instance, `NODE_ENV="development"`. Please set this globally, if it is not set by default on your machine.

Before building, edit your `.env.development` to set up your MySQL database connection parameters. Their variables should be self-explanatory.

Use the following command to edit the .env.development file if desired \(make your changes and then type ctrl + x to exit and save\):

```bash
nano .env.development
```

### Configure the bhima user in MySQL and build the app

```bash
#Run the following commands to create the bhima user in MySQL, so that it can build the database (make sure the user and #password both match what you set in the .env.development file):

sudo mysql -u root -p
CREATE USER 'bhima'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'bhima'@'localhost';
#Use ctrl + z to get back to the main terminal prompt
```

Then, build the app with

```bash
# build the application

NODE_ENV="development" yarn build
```

### Creating a database

_NOTE: BHIMA runs in _`sql_mode='STRICT_ALL_TABLES'`_. While it is not necessary to have this set to build the database, the tests will not pass unless the correct SQL\_MODE is set._

```bash
#To configure MySQL with this setting, run the following commands:
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

#Under the section [mysqld], add in the following text:
sql-mode = STRICT_ALL_TABLES

# save and quit, then restart mysql with the following command:
sudo service mysql restart
```

The database structure is contained in the `server/models/*.sql` files. You can execute these one by one in the order below, or simply run `yarn build:db`.

1. `server/models/schema.sql`
2. `server/models/triggers.sql`
3. `server/models/functions.sql`
4. `server/models/procedures.sql`
5. `server/models/admin.sql`

This sets up the basic schema, triggers, and routines. The following scripts will build a basic dataset to begin playing around with:

1. `server/models/icd10.sql`
2. `server/models/bhima.sql`
3. `test/data.sql`

You can run all this by using the following command: `yarn build:db` Alternatively, you might use the `./sh/build-database.sh` script, customized with your environmental variables as shown below:

```bash
# install the database
DB_USER='me' DB_PASS='MyPassword' DB_NAME='bhima' ./sh/build-database.sh
```

### Running the Application

Running the application is super easy! Just type `yarn dev` in the application root directory.

### Verify the Install

If you changed the `$PORT` variable in the `.env` file, your application will be listening on that port. By default it is `8080`.

Navigate to [https://localhost:8080](https://localhost:8080) in the browser to verify the installation. You should be greeted with a login page.

### Testing the Application

Our tests are broken into unit tests, end to end tests, and integration tests. There is more information on testing in the [wiki](https://github.com/IMA-WorldHealth/bhima/wiki).

1. **Integration Tests** - These test the server + database integration and generally our APIs. All reachable API endpoints should generally have an integration test associated with them. To run them, type `yarn test:integration`.
2. **Server Unit Tests** - Server libraries are unit tested with mocha and chai, similar to the integration tests. To run them, type
   `yarn test:server-unit.`
3. **Client Unit Tests** - Client components are unit tested with karma which you should have installed if you installed all dependencies. Karma launches a chrome browser to execute the tests. To run them, type `yarn test:client-unit`.
4. **End to End Tests** - The entire stack is tested with \(often flaky\) end to end tests using [protractor](https://github.com/IMA-WorldHealth/bhima/blob/master/docs/protractortest.org). Protractor depends on
   `webdriver-manager` which must be installed separately. See their documentation for more information. The end to end tests can be run with `yarn test:ends`.

You can run all tests by simply typing `yarn test`.

Enjoy using bhima!

Bhima Installation Guide
===========================

*NOTE* This guide is built for bhima version 2.X.  If you are attempting to build version 1.X, see [this repository](https://github.com/IMA-WorldHealth/bhima-1.X).

This guide will get you up and running with bhima locally.  Please note that bhima is under active development and should *not* be used commercially.  If you are interested in development progress, shoot us a line at <developers@imaworldhealth.org>.

###### Dependencies
Before you begin the installation process, please make sure you have all the bhima dependencies installed locally.  We only test on Linux, so your best bet is to use a Linux you are familiar with.  Please make sure you have recent version of:
 1. [MySQL](http://dev.mysql.com/downloads/) (5.6 or greater)
 2. [Redis](redis.io)
 3. [NodeJS](https://nodejs.org/en/) (we recommend using [node version manager](https://github.com/creationix/nvm)).

 We also use `node-canvas` to draw nice graphics in PDF reports.  See [node-canvas](https://github.com/Automattic/node-canvas) for complete installation details, but you can quickly install on linux like this:
 ```sh
 sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```


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
./node_modules/.bin/gulp build
```

###### Creating a database
The database structure is contained in the following files:
 1. `server/models/schema.sql`
 2. `server/models/procedures.sql`

For an initial setup, bhima also includes a file `server/models/test/data.sql` that contains sample data to get the application up and running rapidly.  Build all three and customize further from within the running application.

Alternative, you might use the `install.sh` script, customized with your environmental variables as shown below:

```sh
# install the database
./sh/install.sh
```

###### Configuring the Application
Copy the `.env.sample` environmental variable file into `.env.production` and set your preferred environmental variables where required.  Make sure this file is in the root directory.

###### Running the application
Running the application is super easy!  Just type `npm run app` in the application root directory.

###### Verify the install
Navigate to [https://localhost:8080](https://localhost:8080) in the browser to verify the installation.  You should be greeted with a login page.

Enjoy using bhima!

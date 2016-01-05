Bhima Installation Guide
===========================

This guide will get you up and running with bhima locally.  Please note that
bhima is under active development and should *not* be used commercially.

_Note: bhima depends on MySQL (or MariaDB) and NodeJS in order to function.  Be
sure to grab the latest version for both before building the application._

###### Getting the source
Clone the source using git from the [bhima github repository]
(https://github.com/IMA-WorldHealth/bhima).
```bash
$ git clone https://github.com/IMA-WorldHealth/bhima bhima
$ cd bhima
```

###### Installing dependencies 
Bhima uses npm to track server dependencies and the bower package manager to 
track client dependencies. Bower can be installed with `$ npm install -g bower`
Installing all required Bhima dependencies is a simple as running the commands
show below from the top level directory. 

```bash
$ npm install
$ bower install
```

###### Building the source
Bhima uses the [gulp](http://www.gulpjs.com) build tool to build from source.
Install it globally with npm and install other all npm dependencies, then run
the `gulp` command in the client directory as shown below.

```bash
$ # Inside the bhima/ directory
$ npm install -g gulp
$ gulp build
[gulp] [21:18:18] Using gulpfile ~\proto\remote\client\gulpfile.js
[gulp] [21:18:18] Starting 'default'...
[gulp] [21:18:18] Starting 'scripts'...
[gulp] [21:18:18] Starting 'styles'...
[gulp] [21:18:18] Starting 'assets'...
[gulp] [21:18:18] Starting 'vendor'...
[gulp] [21:18:18] Starting 'static'...
[gulp] [21:18:18] Finished 'default' after 23 ms
[gulp] [21:18:19] Finished 'assets' after 609 ms
[gulp] [21:18:19] Finished 'styles' after 626 ms
[gulp] [21:18:19] Finished 'vendor' after 623 ms
[gulp] [21:18:19] Finished 'scripts' after 642 ms
[gulp] [21:18:19] Finished 'static' after 626 ms
```

###### Creating a database
Bhima database structure is contained in the file `server/sql/bhima.sql`.  For
an initial setup, bhima also includes a file `server/sql/base.sql` to get the
application up and running rapidly.  Build one or both, and customize further
from within the running application.

###### Running the application
Bhima separates the client and server into separate directories the compiled
versions in a bin/ folder. The app is run from the bin folder.  
Enter the bin folder, and run
`node server/app.js`.

```bash
$ node server/app.js
Creating connection pool...
Application running on localhost:8080
[db.js] (*) user . logged_in set to 0
```

Alternatively the server can be run from the top level directory using the npm 
tool, as follows:

```bash 
$ npm run app
```

###### Verify the install
Navigate to https://localhost:8080 in the browser to verify the installation.  
You should be greated with a login page.

###### Testing

We use mocha for our unit tests and protractor for our end-to-end tests.  All tests
can be run using `gulp`.

###### Advanced - configuring the application
All configuration options are found in the configuration file located in
`server/config.json`.  These options are straightforward and documented
elsewhere.

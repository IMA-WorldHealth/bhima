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

###### Building the source
Bhima uses the [gulp](http://www.gulpjs.com) build tool to build from source.
Install it globally with npm and install other all npm dependencies, then run
the `gulp` command in the client directory as shown below.

```bash
$ # Inside the bhima/ directory
$ npm install -g gulp later dot
$ npm install
$ cd client && gulp build
# This output may vary
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
Bhima separates the client and server into separate directories.  The app is run
from the top level directory.  Enter the top level directory, and run
`node server/app.js`.

```bash
$ node server/app.js
Creating connection pool...
Application running on localhost:8080
[db.js] (*) user . logged_in set to 0
```

###### Verify the install
Navigate to https://localhost:8080 in the browser to verify the installation.
You should be greated with a login page.

###### Advanced - configuring the application
All configuration options are found in the configuration file located in
`server/config.json`.  These options are straightforward and documented
elsewhere.

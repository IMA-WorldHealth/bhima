Bhima Installation Guide
===========================

*NOTE* This guide is built for bhima version 2.X.  If you are attempting to build
version 1.X, see [this repository](https://github.com/IMA-WorldHealth/bhima-1.X).

This guide will get you up and running with bhima locally.  Please note that
bhima is under active development and should *not* be used commercially.

_Note: bhima depends on MySQL (or MariaDB) and NodeJS in order to function.  Be
sure to grab the latest version for both before building the application._

###### Getting the source
Clone the source using git from the [bhima github repository]
(https://github.com/IMA-WorldHealth/bhima).
```bash
$ git clone https://github.com/IMA-WorldHealth/bhima-2.X bhima-2.X
$ cd bhima-2.X
```

###### Building the source
Bhima uses the [gulpjs](http://www.gulpjs.com) build tool to build from source.
Install it globally with npm and install other all npm dependencies, then run
the `gulp build` command in the client directory as shown below.

```bash
$ # Inside the bhima-2.X/ directory
$ npm install -g gulp later dot mocha bower
$ npm install
$ bower install -f
$ gulp build
# lots of console output..
```

Alternatively, you can use the installation script found in the `/sh` folder to
download all dependencies, build the server and databases.  The syntax looks like
this:

```bash
$ # inside the bhima-2.X directory
$ ./sh/install.sh -d
```

For full usage information, use the `-h` help flag.

###### Creating a database
Bhima database structure is contained in the file `server/sql/bhima.sql`.  For
an initial setup, bhima also includes a file `server/sql/base.sql` to get the
application up and running rapidly.  Build one or both, and customize further
from within the running application.

###### Running the application
Running bhima is super easy!  Just type `npm run app`.


###### Verify the install
Navigate to https://localhost:8080 in the browser to verify the installation.
You should be greated with a login page.

###### Advanced - configuring the application
All configuration options are found in the configuration file located in
`server/config.json`.  These options are straightforward and documented
elsewhere.

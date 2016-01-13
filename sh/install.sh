#!/bin/bash

# install.sh
# A small script to help set up the bhima application.
# NOTE: root privileges are required for some parts of the script.

usage () {
  echo "Usage: ./sh/install.sh [-hrd]"
  echo "         -h  help      Display this help message."
  echo "         -r  rebuild   Force the database to rebuild using a DROP "
  echo "                       SCHEMA statement."
  echo "         -d  depends   Download dependencies from the internet."
  exit 1
}

REBUILD=0;
DEPENDENCIES=0;

DB_NAME='bhima';
DB_USER='bhima';
DB_PASS='HISCongo2013';

while getopts ":hrd" opt; do
  case $opt in
    h)
      usage
      exit 1
      ;;
    r)
      REBUILD=1
      ;;
    d)
      DEPENDENCIES=1
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      usage
      exit 1
      ;;
  esac
done

# dependency installation
build_depends () {
  echo "Installing online dependencies ..."
  echo "Please put in your super user password to install global dependencies."
  sudo npm install -g gulp bower mocha
  echo "Installing local dependencies ..."
  npm install
  bower install -f
}

# build the database
build_db () {
  echo "Building the bhima database ... "

  # force database rebuild from command line option
  if [ $REBUILD -eq 1 ]
    then
      echo "Executing DROP SCHEMA command, since install was called with -r (rebuild)."
      mysql -u $DB_USER -p$DB_PASS -e "DROP SCHEMA IF EXISTS $DB_NAME;"
  fi
  mysql -u $DB_USER -p$DB_PASS -e "CREATE SCHEMA IF NOT EXISTS $DB_NAME;"

  echo "Building schema ..."
  mysql -u $DB_USER -p$DB_PASS bhima < server/models/schema.sql

  echo "Importing data ..."
  mysql -u $DB_USER -p$DB_PASS bhima < server/models/test/data.sql

  echo "Running db upgrades ..."
  #mysql -u $DB_USER -p$DB_PASS bhima < server/models/updates/synt.sql
}

# compile the server using gulp
build_server () {
  echo "Building the bhima server ... "
  gulp build
}

# actually run the script
main () {

  # allow user to ask that dependencies are installed with -d flag
  if [ $DEPENDENCIES -eq 1 ]; then
    build_depends
  fi

  build_db
  build_server
}

main

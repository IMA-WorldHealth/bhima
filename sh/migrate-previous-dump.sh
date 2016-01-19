#!/bin/bash

# A small utility to upgrade the previous bhima database to UTF-8 and
# correct storage engines from a raw data dump.

# Usage: ./sh/migrate-previous-dump.sh path/to/bhima/dump.sql

# Expect the file name to be the first argument
FILE=$1;

echo "Upgrading database from dump file: $FILE"

echo "Upgrading charsets ..."
sed -i 's/CHARSET=latin1/CHARSET=utf8/g' $FILE

echo "Upgrading storage engines ..."
sed -i 's/ENGINE=MyISAM/ENGINE=InnoDB/g' $FILE

echo "Resetting AUTO_INCREMENT values ..."
sed -i 's/AUTO_INCREMENT=[0-9]\+//g' $FILE

echo "... done."

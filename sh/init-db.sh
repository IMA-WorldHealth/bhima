#!/bin/bash

# This assumes you run tests from the top level bhima directory.

echo "Building test database for e2e tests..."

# TODO - store these in environmental variables somehow
DB_USER='bhima'
DB_PASS='HISCongo2013'
DB_NAME='bhima_test'

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

# build the test database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;"

echo "Building schema"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
echo "Building triggers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql
echo "Building functions and procedures"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/admin.sql
echo "Building test database"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/icd10.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < test/data.sql

mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeEntityMap();"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeDocumentMap();"

echo "End of build ...."

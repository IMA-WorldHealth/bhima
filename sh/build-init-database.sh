#!/usr/bin/env bash

# bash script mode
set -uo pipefail

# This script is for building the initial database of bhima application
# this database is supposed to be the starting point of any bhima installation

echo "[ build ] Building BHIMA Database"

set -a
source .env.development
set +a

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

# build the initial database
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST -e "DROP DATABASE IF EXISTS $DB_NAME ;" &> /dev/null || { echo 'failed to drop DB' ; exit 1; }
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;" &> /dev/null || { echo 'failed to create DB' ; exit 1; }

echo "[ build ] database schema"
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/schema.sql &> /dev/null || { echo 'failed to build DB scheme' ; exit 1; }

echo "[ build ] triggers"
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/triggers.sql &> /dev/null || { echo 'failed to import triggers into DB' ; exit 1; }

echo "[ build ] functions"
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/functions.sql &> /dev/null || { echo 'failed to import functions into DB' ; exit 1; }

echo "[ build ] procedures"
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/procedures.sql &> /dev/null || { echo 'failed to import procedures into DB 1/2' ; exit 1; }
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/admin.sql &> /dev/null || { echo 'failed to import procedures into DB 2/2' ; exit 1; }

echo "[ build ] default data"
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/icd10.sql &> /dev/null || { echo 'failed to import default data into DB 1/2' ; exit 1; }
mysql -u $DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < server/models/bhima.sql &> /dev/null || { echo 'failed to import default data into DB 2/2' ; exit 1; }

echo "[ /build ]"

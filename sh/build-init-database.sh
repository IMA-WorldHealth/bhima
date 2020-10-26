#!/usr/bin/env bash

# bash script mode
set -o pipefail

# This script is for building the initial database of bhima application
# this database is supposed to be the starting point of any bhima installation

echo "[ build ] Building BHIMA Database"

set -a
source .env || { echo "[build-init-database.sh] could not load .env, using variables from environment." ; }
set +a

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

fout=/dev/null

if [ "$1" == "debug" ]; then
    fout=/dev/tty
fi

# build the initial database
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "DROP DATABASE IF EXISTS $DB_NAME ;" || { echo "failed to drop DB" ; exit 1; }
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || { echo "failed to create DB" ; exit 1; }

echo "[ build ] database schema"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/schema.sql || { echo "failed to build DB scheme" ; exit 1; }

echo "[ build ] functions"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/functions.sql || { echo "failed to import functions into DB" ; exit 1; }

echo "[ build ] procedures"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/procedures.sql
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/admin.sql || { echo "failed to import procedures into DB 2/2" ; exit 1; }

echo "[ build ] triggers"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/triggers.sql

echo "[ build ] default data"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/icd10.sql || { echo "failed to import default data into DB 1/2" ; exit 1; }
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < server/models/bhima.sql || { echo "failed to import default data into DB 2/2" ; exit 1; }

echo "[build] recomputing mappings"
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -e "Call zRecomputeEntityMap();" || { echo "failed to recompute mappings 1/2" ; exit 1; }
mysql -u "$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -e "Call zRecomputeDocumentMap();" || { echo "failed to recompute mappings 2/2" ; exit 1; }

echo "[ /build ]"

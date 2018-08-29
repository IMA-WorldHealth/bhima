#!/bin/bash

# bash script mode
set -o pipefail

# This assumes you run tests from the top level bhima directory.

echo "[build]"
echo "Building BHIMA Database"

set -a
source .env.development
set +a

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

fout=/dev/null

if [ "$1" == "debug" ]; then
    fout=/dev/tty
fi

# build the test database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "[build] database schema"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql

echo "[build] triggers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql

echo "[build] functions"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql

echo "[build] procedures"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/admin.sql

echo "[build] default data"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/icd10.sql

mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql

echo "[build] test data"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < test/data.sql

echo "[build] compute account class"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call ComputeAccountClass();"

echo "[build] recomputing mappings"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeEntityMap();"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeDocumentMap();"

echo "[build] recalculating period totals"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecalculatePeriodTotals();"

echo "[/build]"

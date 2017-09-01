#!/bin/bash

# bash script mode
set -uo pipefail

# This assumes you run tests from the top level bhima directory.

echo "[build]"
echo "Building BHIMA Database"

set -a
source .env.development
set +a

# set build timeout
TIMEOUT=${BUILD_TIMEOUT:-8}

# build the test database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS $DB_NAME ;" &> /dev/null
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;" &> /dev/null

echo "[build] database schema"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql &> /dev/null

echo "[build] triggers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql &> /dev/null

echo "[build] functions"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql &> /dev/null

echo "[build] procedures"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql &> /dev/null
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/admin.sql &> /dev/null

echo "[build] default data"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/icd10.sql &> /dev/null
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql &> /dev/null

echo "[build] test data"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < test/development-build.sql 1> /dev/null
echo '[build] updating test data'
mysql -u $DB_USER -p$DB_PASS $DB_NAME < test/update_dev_build.sql 1> /dev/null

echo "[update] account type to account category"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/updates/account_type.sql &> /dev/null

echo "[update] service uuid identifiers"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/updates/service_uuid.sql &> /dev/null

echo "[build] compute account class"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call ComputeAccountClass();" &> /dev/null

echo "[build] recomputing mappings"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeEntityMap();" &> /dev/null
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "Call zRecomputeDocumentMap();" &> /dev/null

echo "[/build]"

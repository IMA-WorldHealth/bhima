#!/bin/bash

# # Uncomment to enable interactive inputs
# read -p "Enter your mysql user (default root): " user
# user=${user:-root}
# 
# echo -n "Enter password: " 
# read -s pw
# echo
DB_USER='bhima'
DB_PASS='HISCongo2013'
DB_NAME='bhima'

echo "Rebuilding the database ..."

# rebuild database
mysql -u $DB_USER -p$DB_PASS -e "DROP DATABASE IF EXISTS bhima;"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE bhima CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql
mysql -u $DB_USER -p$DB_PASS $DB_NAME < server/models/updates/synt.sql

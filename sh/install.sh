#!/bin/bash

# A small script to set up virtual machine instances for deployment or testing.

export ENV="staging"

# make sure we are using the correct SQL mode
mysql -h $DB_HOST -u root -e "SET GLOBAL sql_mode='STRICT_ALL_TABLES';"

# setup usernames and permissions
mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

# setup database
mysql -h $DB_HOST -u root -e "DROP SCHEMA IF EXISTS $DB_NAME;"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "CREATE SCHEMA $DB_NAME CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < server/models/schema.sql
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < server/models/triggers.sql
mysql -u $DB_USER -u $DB_USER -p$DB_PASS $DB_NAME < server/models/functions.sql
mysql -u $DB_USER -u $DB_USER -p$DB_PASS $DB_NAME < server/models/procedures.sql
mysql -u $DB_USER -u $DB_USER -p$DB_PASS $DB_NAME < server/models/debug.sql
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < server/models/bhima.sql
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < server/models/test/data.sql

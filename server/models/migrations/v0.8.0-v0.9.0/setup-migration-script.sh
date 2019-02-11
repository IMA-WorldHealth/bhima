#!/usr/bin/env bash

# usage: DATABASE="my_database_name" BHIMA_PATH="path/to/bhima/" ./setup-migration-script.sh

# this script rebuild function and procedure 
FILENAME="migration"

# database name given as parameter, default is imck
# usage: DATABASE="bhima_test" ./setup-migration-script.sh
DEFAULT_DATABASE="imck"
DATABASE=${DATABASE:-$DEFAULT_DATABASE}

# bhima path
DEFAULT_BHIMA_PATH="$HOME/IMA/bhima-2.x"
BHIMA_PATH=${BHIMA_PATH:-$DEFAULT_BHIMA_PATH}

# path to the cleaned migration script
CLEANED_MIGRATION_SCRIPT="./migrate.revised.sql"

echo "Setting up script..."
echo "SET names 'utf8mb4';
SET character_set_database = 'utf8mb4';
SET collation_database = 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4, CHARACTER_SET_CONNECTION = utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
" > $FILENAME-$DATABASE.sql

echo "Dropping all triggers for database: $DATABASE."
mysql -e "SELECT CONCAT('DROP TRIGGER ', trigger_name, ';') FROM information_schema.triggers WHERE trigger_schema = '$DATABASE';" \
  | sed '1d' \
  >> $FILENAME-$DATABASE.sql

echo "" >> $FILENAME-$DATABASE.sql

echo "Dropping all routines for database: $DATABASE."
mysql -e "SELECT CONCAT('DROP ',ROUTINE_TYPE,' IF EXISTS ',ROUTINE_SCHEMA,'.',ROUTINE_NAME,';') as stmt FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = '$DATABASE';" \
  | sed '1d' \
  >> $FILENAME-$DATABASE.sql

echo "" >> $FILENAME-$DATABASE.sql
echo "Sourcing all routines from BHIMA."

cat $BHIMA_PATH/server/models/triggers.sql \
  $BHIMA_PATH/server/models/functions.sql \
  $BHIMA_PATH/server/models/procedures/*.sql \
  $BHIMA_PATH/server/models/admin.sql \
  >> $FILENAME-$DATABASE.sql

echo "" >> $FILENAME-$DATABASE.sql
echo "Apply updates of structure and data"

cat $CLEANED_MIGRATION_SCRIPT >> $FILENAME-$DATABASE.sql

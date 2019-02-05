#!/usr/bin/env bash

# this script rebuild function and procedure 

DATABASE="imck"
FILENAME="migration"

# path to the cleaned migration script
CLEANED_MIGRATION_SCRIPT="./migrate.revised.sql"

# path to bhima root from ./server/models/migrations/v0.8.0-v0.9.0
BHIMA_PATH="$HOME/IMA/bhima-2.x"

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

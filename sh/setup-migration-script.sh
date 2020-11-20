#!/usr/bin/env bash

# bash script mode
set -uo pipefail

# This script creates a migration script to upgrade BHIMA from the previous version of BHIMA
# to the next version.  It will only pull in data from the next/*.sql folder, so it can only
# upgrade from the most recent version to the current version.

# NOTE: the file used to determined variables is the .env file.  Please make sure
# this file is up to date.

# TODO(@jniles) - look up current version, and pull in all versions until present version.

echo "[migrate] Migrating BHIMA database"

echo "[migrate] Reading settings from .env."

set -a
source .env || { echo '[setup-migration-script.sh] could not load .env, using variables from environment.' ; }
set +a

# Set up variables used for naming things
FILENAME="migration"
DATABASE="$DB_NAME"
MIGRATION_FILE="$FILENAME-$DATABASE.sql"

echo "[migrate] Using database \"$DATABASE\" defined in environment file."

# path to the BHIMA application.  Since we are in the context of the repository, it
# is just the directory above.
BHIMA_PATH="$(pwd)"

# make sure the database has the correct character sets and encodings
echo "[migrate] Setting up script with charsets and encodings..."
echo "SET names 'utf8mb4';
SET character_set_database = 'utf8mb4';
SET collation_database = 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4, CHARACTER_SET_CONNECTION = utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
" > $MIGRATION_FILE

echo "[migrate] Adding DROP TRIGGERS for $DATABASE."
mysql -u $DB_USER --password=$DB_PASS -e "SELECT CONCAT('DROP TRIGGER IF EXISTS ', trigger_name, ';') FROM information_schema.triggers WHERE trigger_schema = '$DATABASE';" \
  | sed '1d' \
  >> $MIGRATION_FILE

echo "" >> $MIGRATION_FILE

echo "[migrate] Adding DROP ROUTINES for $DATABASE."
mysql -u $DB_USER --password=$DB_PASS -e "SELECT CONCAT('DROP ',ROUTINE_TYPE,' IF EXISTS ',ROUTINE_SCHEMA,'.',ROUTINE_NAME,';') as stmt FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = '$DATABASE';" \
  | sed '1d' \
  >> $MIGRATION_FILE

echo "" >> $MIGRATION_FILE

echo "[migrate] Adding latest triggers, functions, and procedures to $DATABASE."
cat $BHIMA_PATH/server/models/functions.sql \
  $BHIMA_PATH/server/models/procedures/*.sql \
  $BHIMA_PATH/server/models/admin.sql \
  $BHIMA_PATH/server/models/triggers.sql \
  >> $MIGRATION_FILE

echo "" >> $MIGRATION_FILE

echo "[migrate] Finished creating script skeleton"
echo "[migrate] Adding manual migrations from next/migrate.sql"

cat $BHIMA_PATH/server/models/migrations/next/migrate.sql >> $MIGRATION_FILE

# Add migration files specific to this production server
for sitefile in `\ls $BHIMA_PATH/server/models/migrations/next/*$DATABASE*.sql 2>/dev/null`;
do
    echo "[migrate] Adding site-specific migration file: $sitefile"
    cat $sitefile >> $MIGRATION_FILE
done
echo "[migrate] Finished constructing migration script."
echo "[migrate] Execute \"mysql $DATABASE < $MIGRATION_FILE\" with appropriate permissions to migrate"

#!/usr/bin/env bash

## set database environment
# set -euo pipefail

export ROOT_DB_PASS="Password12!"

echo "Inside DB_HOST: $DB_HOST"
echo "Inside DB_USER : $DB_USER"
echo "Inside SESS_SECRET: $SESS_SECRET"

# setup usernames and permissions
mysql -u root -p$ROOT_DB_PASS -e "CREATE USER $DB_USER@$DB_HOST IDENTIFIED WITH mysql_native_password BY '$DB_PASS';" || { echo 'failed to create DB user' ; exit 1; }
mysql -u root -p$ROOT_DB_PASS -e "GRANT ALL PRIVILEGES ON *.* TO $DB_USER@$DB_HOST WITH GRANT OPTION;" || { echo 'failed to grant permissions to DB user' ; exit 1; }
mysql -u root -p$ROOT_DB_PASS -e "FLUSH PRIVILEGES;" || { echo 'failed to flush privileges' ; exit 1; }

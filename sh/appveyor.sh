#!/usr/bin/env bash

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

ROOT_DB_PASS="Password12!"

# setup usernames and permissions
mysql -h $DB_HOST -u root -p$ROOT_DB_PASS -e "CREATE USER '$DB_USER'@'$DB_HOST' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';" || { echo 'failed to create DB user' ; exit 1; }
mysql -h $DB_HOST -u root -p$ROOT_DB_PASS -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' WITH GRANT OPTION;" || { echo 'failed to grant permissions to DB user' ; exit 1; }
mysql -h $DB_HOST -u root -p$ROOT_DB_PASS -e "FLUSH PRIVILEGES;" || { echo 'failed to flush privileges' ; exit 1; }

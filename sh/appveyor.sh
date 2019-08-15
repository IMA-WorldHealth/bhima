#!/usr/bin/env bash

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

ROOT_DB_PASS="Password12!"

# setup usernames and permissions
mysql -h $DB_HOST -u root -p$ROOT_DB_PASS -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -p$ROOT_DB_PASS -e "FLUSH PRIVILEGES;"

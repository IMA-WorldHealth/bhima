#!/usr/bin/env bash

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

# setup usernames and permissions
mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

# install greenkeeper lockfile
yarn global add greenkeeper-lockfile@1
export GK_LOCK_YARN_OPTS="--ignore-engines"

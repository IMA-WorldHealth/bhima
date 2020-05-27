#!/usr/bin/env bash

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

mysql --version

# setup usernames and permissions
if [ "$DB" = 'MARIADB' ]
then
  mysql -h $DB_HOST -u root -e "CREATE USER '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS';"
else
  mysql -h $DB_HOST -u root -e "CREATE USER '$DB_USER'@'$DB_HOST' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';"
fi

mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

##
## This script is for Travis CI to build the default user to for the database.
##
set -euo pipefail

set -a
source .env.development
set +a

mysql -h $DB_HOST -u root -e "SET GLOBAL sql_mode='STRICT_ALL_TABLES';"

# setup usernames and permissions
mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

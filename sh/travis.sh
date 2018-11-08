##
## This script is for Travis CI to configure and install required software.
##

## mysql is installed by default on travis, so we can set mysql server charset as utf8mb4
echo -e "
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
collation-server=utf8mb4_unicode_ci
init-connect='SET NAMES utf8mb4'
character-set-server=utf8mb4
sql-mode=\"STRICT_ALL_TABLES\" " | sudo tee -a /etc/mysql/conf.d/99_custom_travis.cnf

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

# setup usernames and permissions
mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

## install and configure software
export CHROME_BIN=/usr/bin/google-chrome

# start xvfb will screen size of 1280x1024
/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16

# download and install wkhtmltopdf globally
wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.4/wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
tar -xf wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
sudo mv ./wkhtmltox/bin/wkhtmltopdf  /usr/bin/wkhtmltopdf

# install greenkeeper lockfile
yarn global add greenkeeper-lockfile@1
export GK_LOCK_YARN_OPTS="--ignore-engines"

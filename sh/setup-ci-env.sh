#!/usr/bin/env bash

##
## This script is for both Appveyor and Travis to configure and install required software to
## get BHIMA up and running.
##

## mysql is installed by default on appveyor, so we can set mysql server charset as utf8mb4
echo -e "
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
collation-server=utf8mb4_unicode_ci
init-connect='SET NAMES utf8mb4'
character-set-server=utf8mb4
sql-mode=\"STRICT_ALL_TABLES\" " | sudo tee -a /etc/mysql/conf.d/99_custom_ci.cnf

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

mkdir -p test/artifacts

# restart mysql once chanes have been made
sudo service mysql restart

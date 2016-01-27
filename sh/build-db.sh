#!/bin/bash

# # Uncomment to enable interactive inputs
# read -p "Enter your mysql user (default root): " user
# user=${user:-root}
# 
# echo -n "Enter password: " 
# read -s pw
# echo
user='bhima'
pw='HISCongo2013'

echo "Rebuilding the database ..."

# rebuild database
mysql -u $user -p$pw -e "DROP DATABASE IF EXISTS bhima;"
mysql -u $user -p$pw -e "CREATE DATABASE bhima CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
mysql -u $user -p$pw bhima < server/models/schema.sql
mysql -u $user -p$pw bhima < server/models/test/data.sql

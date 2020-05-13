#!/usr/bin/env bash
wget https://repo.mysql.com/mysql-apt-config_0.8.15-1_all.deb
dpkg -i mysql-apt-config_0.8.15-1_all.deb
apt-get update -q
apt-get install -q -y --allow-unauthenticated -o Dpkg::Options::=--force-confnew mysql-server
systemctl restart mysql
mysql_upgrade

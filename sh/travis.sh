#!/usr/bin/env bash

## set database environment
set -euo pipefail

set -a
source .env.development
set +a

mysql --version

# setup usernames and permissions
mysql -h $DB_HOST -u root -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS' WITH GRANT OPTION;"
mysql -h $DB_HOST -u root -e "FLUSH PRIVILEGES;"

echo "Downloading chrome revision: $CHROME_REVISION"
echo "Download URL: https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/$CHROME_REVISION/chrome-linux.zip"

wget -q -O chrome.zip "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/$CHROME_REVISION/chrome-linux.zip"
unzip -q chrome.zip
rm chrome.zip

echo "Downloaded chrome version: $($PWD/chrome-linux/chrome --version)"

sudo ln -sf "$PWD/chrome-linux/chrome" /usr/bin/chromium
sudo ln -sf /usr/bin/chromium /usr/bin/chromium-browser
sudo ln -sf /usr/bin/chromium /usr/bin/google-chrome

sudo groupadd -r chrome && sudo useradd -r -g chrome -G audio,video chrome

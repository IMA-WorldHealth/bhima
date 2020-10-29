#!/bin/bash

# bash script mode
set -eo pipefail

OWNER="ima-worldhealth"
REPO="bhima"

echo "looking up latest version of $REPO"
VERSION=$(curl -s "https://github.com/$OWNER/$REPO/releases/latest/download" 2>&1 | sed "s/^.*download\/\([^\"]*\).*/\1/")
echo "found $VERSION"

echo "downloading $VERSION from codeload.github.com to /tmp/bhima.tar.gz"
wget -O /tmp/bhima.tar.gz -q https://codeload.github.com/$OWNER/$REPO/legacy.tar.gz/$VERSION
echo "done."

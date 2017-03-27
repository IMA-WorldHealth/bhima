#!/bin/bash
set -uo pipefail

ESLINT="./node_modules/.bin/eslint"

# eslint will not report warnings, just errors
$ESLINT --quiet --env node server/

#$ESLINT client/src/js/
#$ESLINT client/src/partials/

exit 0

#!/bin/bash
##
## Lint Test
##

# bash 'strict mode'
set -uo pipefail

# locate local the eslint binary
ESLINT="./node_modules/.bin/eslint"

# Compare the current branch to the master branch and retain files that
# have changed.
FILES=$(git diff master --stat --name-only | grep .js)
LINES=$(echo "$FILES" | wc -l)

if [ -n "$FILES" ]; then
  echo "git diff shows $LINES changed.  Linting those files."
  $ESLINT --quiet --env node $FILES
fi

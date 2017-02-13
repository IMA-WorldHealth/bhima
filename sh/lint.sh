#!/bin/bash

ESLINT="./node_modules/.bin/eslint"

$ESLINT server/
$ESLINT client/src/js/
$ESLINT client/src/partials/

exit 0

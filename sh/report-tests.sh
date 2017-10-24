#!/bin/bash
set -euo pipefail
./node_modules/.bin/mocha --recursive ./test/temporary-financial-reports/

#!/bin/bash

# bash script mode
set -euo pipefail

# run lint tests
./sh/lint.sh

# run integration tests
./sh/integration-tests.sh

# run karma (client unit) tests
./node_modules/.bin/karma start --single-run --no-auto-watch --concurrency 1 karma.conf.js

# run end to end tests
./sh/test-ends.sh

exit 0;

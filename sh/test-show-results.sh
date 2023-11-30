#!/bin/bash

if [[ ! -d results ]]; then
  echo "There are no test results!"
  echo
  exit
fi

echo "TEST RESULTS SUMMARY"
echo
if test -f "./results/client-unit-report"; then
  sed -i -e 's/\x1b\[1A//g' ./results/client-unit-report  # Remove ANSI sequence that disrupts the display
  echo "Client Unit Tests"
  echo "   " `grep "TOTAL" ./results/client-unit-report`
  echo
fi
if test -f "./results/server-unit-report"; then
  sed -i -e 's/\x1b\[1A//g' ./results/server-unit-report  # Remove ANSI sequence that disrupts the display
  echo "Server Unit Tests"
  echo "   " `grep 'passing' ./results/server-unit-report`
  echo "   " `grep 'failing' ./results/server-unit-report`
  echo
fi
if test -f "./results/integration-report"; then
  sed -i -e 's/\x1b\[1A//g' ./results/integration-report  # Remove ANSI sequence that disrupts the display
  echo "Integration Tests"
  echo "   " `grep passing ./results/integration-report`
  echo "   " `egrep -e '(failing|pending)' ./results/integration-report`
  echo
fi
if test -f "./results/integration-stock-report"; then
  sed -i -e 's/\x1b\[1A//g' ./results/integration-stock-report  # Remove ANSI sequence that disrupts the display
  echo "Stock Integration Tests"
  echo "   " `grep passing ./results/integration-stock-report`
  echo "   " `egrep -e '(failing|pending)' ./results/integration-stock-report`
  echo
fi

# Show the E2E account tests, if available
if test -f "./results/end-to-end-report-account"; then
  sed -i -e 's/\x1b\[1A//g' ./results/end-to-end-report-account  # Remove ANSI sequence that disrupts the display
  echo "End-to-end account tests (Playwright)"
  echo "   " `grep passed ./results/end-to-end-report-account`
  echo "   " `egrep -e '([0-9]+ failing|[0-9]+ failed|[0-9]+ pending|[0-9]+ skipped|[0-9]+ flakey)' ./results/end-to-end-report-account`
  echo
fi

# Show all the E2E tests, if available
for i in {1..8}; do
  if test -f "./results/end-to-end-report-$i"; then
    sed -i -e 's/\x1b\[1A//g' ./results/end-to-end-report-$i  # Remove ANSI sequence that disrupts the display
    echo "End-to-end tests $i (Playwright)"
    echo "   " `grep passed ./results/end-to-end-report-$i`
    echo "   " `egrep -e '([0-9]+ failing|[0-9]+ failed|[0-9]+ pending|[0-9]+ skipped|[0-9]+ flakey)' ./results/end-to-end-report-$i`
    echo
  fi
done

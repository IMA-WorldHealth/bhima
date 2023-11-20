#!/bin/bash

echo "TEST RESULTS SUMMARY"
echo
if test -f "./results/client-unit-report"; then
  echo "Client Unit Tests"
  echo "   " `grep "TOTAL" ./results/client-unit-report`
  echo
fi
if test -f "./results/server-unit-report"; then
  echo "Server Unit Tests"
  echo "   " `grep 'passing' ./results/server-unit-report`
  echo "   " `grep 'failing' ./results/server-unit-report`
  echo
fi
if test -f "./results/integration-report"; then
  echo "Integration Tests"
  echo "   " `grep passing ./results/integration-report`
  echo "   " `egrep -e '(failing|pending)' ./results/integration-report`
  echo
fi
if test -f "./results/integration-stock-report"; then
  echo "Stock Integration Tests"
  echo "   " `grep passing ./results/integration-stock-report`
  echo "   " `egrep -e '(failing|pending)' ./results/integration-stock-report`
  echo
fi
if test -f "./results/end-to-end-account-report"; then
  echo "End-to-end account tests (Playwright)"
  echo "   " `grep passed ./results/end-to-end-account-report`
  echo "   " `egrep -e '([0-9]+ failing|[0-9]+ failed|[0-9]+ pending|[0-9]+ skipped|[0-9]+ flakey)' ./results/end-to-end-account-report`
  echo
fi
if test -f "./results/end-to-end-stock-report"; then
  echo "End-to-end stock tests (Playwright)"
  echo "   " `grep passed ./results/end-to-end-stock-report`
  echo "   " `egrep -e '([0-9]+ failing|[0-9]+ failed|[0-9]+ pending|[0-9]+ skipped|[0-9]+ flakey)' ./results/end-to-end-stock-report`
  echo
fi
if test -f "./results/end-to-end-report"; then
  echo "End-to-end tests without stock or account tests (Playwright)"
  echo "   " `grep passed ./results/end-to-end-report`
  echo "   " `egrep -e '([0-9]+ failing|[0-9]+ failed|[0-9]+ pending|[0-9]+ skipped|[0-9]+ flakey)' ./results/end-to-end-report`
  echo
fi
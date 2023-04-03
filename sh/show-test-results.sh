#!/bin/bash

echo "TEST RESULTS SUMMARY"
echo
echo "Client Unit Tests"
echo "   " `grep "TOTAL" ./test/client-unit/report`
echo
echo "Client Unit Tests"
echo "   " `grep 'passing' ./test/server-unit/report`
echo "   " `grep 'failing' ./test/server-unit/report`
echo
echo "Integration Tests"
echo "   " `grep passing ./test/integration/report`
echo "   " `egrep -e '(failing|pending)' ./test/integration/report`
echo
echo "Stock Integration Tests"
echo "   " `grep passing ./test/integration-stock/report`
echo "   " `egrep -e '(failing|pending)' ./test/integration-stock/report`
echo

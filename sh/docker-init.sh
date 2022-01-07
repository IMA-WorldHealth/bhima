#!/bin/bash

set -e

cat server/models/schema.sql > temp/docker-build-schema.sql

cat server/models/functions.sql \
 server/models/procedures/cash.sql \
 server/models/procedures/invoicing.sql \
 server/models/procedures/time_period.sql \
 server/models/procedures/voucher.sql \
 server/models/procedures/location.sql \
 server/models/procedures/trial_balance.sql \
 server/models/procedures/stock.sql \
 server/models/procedures/inventory.sql \
 server/models/procedures/account.sql \
 server/models/procedures/roles.sql \
 server/models/procedures/payroll.sql \
 server/models/procedures/analysis.sql \
 server/models/procedures/migration-process.sql \
 server/models/procedures/cost_centers.sql \
 server/models/admin.sql \
 server/models/triggers.sql > temp/docker-build-procedures.sql

cat server/models/icd10.sql \
 server/models/bhima.sql > temp/docker-build-data.sql


sed -i '/DELIMITER/d' temp/docker-build-schema.sql
sed -i '/DELIMITER/d' temp/docker-build-procedures.sql
sed -i '/DELIMITER/d' temp/docker-build-data.sql

cat temp/docker-build-schema.sql > temp/docker-build.sql
echo "DELIMITER \$\$" >> temp/docker-build.sql
cat temp/docker-build-procedures.sql >> temp/docker-build.sql
echo "DELIMITER ;" >> temp/docker-build.sql
cat temp/docker-build-data.sql >> temp/docker-build.sql
echo "Call zRecomputeEntityMap();" >> temp/docker-build.sql
echo "Call zRecomputeDocumentMap();" >> temp/docker-build.sql

rm temp/docker-build-schema.sql
rm temp/docker-build-procedures.sql
rm temp/docker-build-data.sql

#!/bin/bash

cat server/models/schema.sql \
 server/models/functions.sql \
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
 server/models/procedures.sql \
 server/models/admin.sql \
 server/models/triggers.sql \
 server/models/icd10.sql \
 server/models/bhima.sql \
> temp/docker-build.sql

echo "Call zRecomputeEntityMap();" >> temp/docker-build.sql
echo "Call zRecomputeDocumentMap();" >> temp/docker-build.sql

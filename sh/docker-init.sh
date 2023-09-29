#!/bin/bash

# bash "strict mode"
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

cat server/models/schema.sql > temp/docker-build-schema.sql

cat server/models/functions.sql \
 server/models/procedures.sql \
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
echo "Call zRecalculatePeriodTotals();" >> temp/docker-build.sql

rm temp/docker-build-schema.sql
rm temp/docker-build-procedures.sql
rm temp/docker-build-data.sql

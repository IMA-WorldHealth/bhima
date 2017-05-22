/* eslint no-console:"off" */
const execute = require('./lib').execute;
const q = require('q');
require('dotenv').config({ path : '.env.development' });

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

/**
 * This function builds the database given a name.
 */
function buildDatabaseWithName(name) {
  console.log('Beginning database build');

  const commands = [
    `mysql -u${DB_USER} -p${DB_PASS} -e "DROP DATABASE IF EXISTS ${name};"`,
    `mysql -u${DB_USER} -p${DB_PASS} -e "CREATE DATABASE ${name} CHARACTER SET utf8 COLLATE utf8_unicode_ci;"`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/schema.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/triggers.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/functions.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/procedures.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/admin.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/icd10.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < server/models/bhima.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} < test/data.sql`,
    `mysql -u${DB_USER} -p${DB_PASS} ${name} -e "Call zRecomputeEntityMap(); Call zRecomputeDocumentMap();"`,
  ];

  const promise = commands
    .reduce((chain, fn) => chain.then(execute(fn)), q());

  promise
    .then(() => console.log('Database Successfully Built.'))
    .catch(() => console.log('An error occurred.'));
}

buildDatabaseWithName(process.env.DB_NAME);

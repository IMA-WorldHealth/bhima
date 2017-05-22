/* eslint no-console:"off" */
const lib = require('./lib');

const MYSQL_USER = 'bhima';
const MYSQL_PASSWORD = 'HISCongo2013';
const MYSQL_NAME = 'bhima_test';

function generateRandomDatabase(prefix) {
  const name = `${prefix || 'bhima'}_${lib.random()}`;
  return lib.execute(`mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "CREATE SCHEMA ${name};"`)
    .then(() => {
      return name;
    });
}

/**
@function cloneDatabase

@description
This function clones a database via mysqldump with
*/
function cloneDatabaseIntoNewDatabase(databaseName, newDatabaseName) {
  console.log(`Cloning database ${databaseName} into ${newDatabaseName}`);
  return lib.execute(`
    mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SET AUTOCOMMIT = 0; SET FOREIGN_KEY_CHECKS=0;"`)
  .then(() => lib.execute(`
    mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${databaseName} \
      --quick \
      --routines \
      --compress \
      --no-create-db \
      --complete-insert \
      --hex-blob \
      --skip-add-locks \
      --disable-keys \
      --single-transaction \
      --ignore-table=${MYSQL_NAME}.document_map \
      --ignore-table=${MYSQL_NAME}.entity_map \
    | mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${newDatabaseName}`))
  .then(() => lib.execute(`
    mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SET FOREIGN_KEY_CHECKS = 1; COMMIT; SET AUTOCOMMIT = 1;"`)
  );
}

function main() {
  generateRandomDatabase(MYSQL_NAME)
    .then(randomDatabaseName => cloneDatabaseIntoNewDatabase(MYSQL_NAME, randomDatabaseName))
    .catch(err => console.error('err:', err));
}

main();

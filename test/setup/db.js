import lib from './lib';
import db from '../../server/lib/db';

// globals!
const MYSQL_USER = 'bhima';
const MYSQL_PASSWORD = 'HISCongo2013';
const MYSQL_NAME = 'bhima_test';

/**
 * @function clone
 *
 * @description
 * This function clones a database via mysqldump, piping the output back into mysql.  In theory,
 * this should save on disk I/O because it avoids writing to a temp file and then reading it out
 * again.  The function returns the new database name
 */
async function clone(name) {
  const dbname = `${name}_${lib.random()}`;

  // create the random schema
  await lib.execute(`mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "CREATE SCHEMA ${dbname};"`);

  // make sure settings are tuned for speed.
  await lib.execute(`
    mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SET AUTOCOMMIT = 0; SET FOREIGN_KEY_CHECKS = 0;"
  `);

  // execute the clone statement via the shell
  await lib.execute(`
    mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${name} \
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
    | mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${dbname}`
  );

  // restore the previous settings
  await lib.execute(`
    mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "SET FOREIGN_KEY_CHECKS = 1; COMMIT; SET AUTOCOMMIT = 1;"
  `);

  return dbname;
}

/**
 * @function remove
 *
 * @description
 * Deletes the database with the
 */
async function remove(name) {
  await lib.execute(`mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "DROP SCHEMA ${name};"`);
}

/**
 * @function connect
 *
 * @description
 * Resets the required lib/db connection to a new database name provided.
 */
function connect(name) {
  const host = 'localhost';
  const user = 'bhima';
  const password = 'HISCongo2013';

  db.setPoolOptions({
    database : name,
    host,
    user,
    password,
  });
}

export { clone, remove, connect };

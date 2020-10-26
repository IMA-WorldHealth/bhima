/* eslint global-require:off */
const { expect } = require('chai');

function DatabaseUnitTests() {
  let db;
  before(() => {
    db = require('../../server/lib/db');
  });

  const tableName1 = 'my_test_table1';
  const tableName2 = 'my_test_table2';
  const constraint1 = 'constraint1';
  const constraint2 = 'constraint2';

  const createTable1Sql = `
    CREATE TABLE IF NOT EXISTS ${tableName1} (
      uuid BINARY(16) PRIMARY KEY,
      name VARCHAR(40)
    )ENGINE=InnoDB DEFAULT CHARSET=latin1;
  `;

  const createTable2Sql = `
    CREATE TABLE IF NOT EXISTS ${tableName2} (
      uuid BINARY(16) PRIMARY KEY,
      type VARCHAR(40),
      uuid_parent BINARY(16),
      uuid_parent2 BINARY(16),
      INDEX \`type\`(\`type\`),
    CONSTRAINT \`${constraint1}\` FOREIGN KEY (\`uuid_parent\`)
    REFERENCES \`${tableName2}\` (\`uuid\`) ON DELETE CASCADE,

    CONSTRAINT \`${constraint2}\` FOREIGN KEY (\`uuid_parent2\`)
    REFERENCES \`${tableName2}\` (\`uuid\`) ON DELETE CASCADE
    )ENGINE=InnoDB DEFAULT CHARSET=latin1;
  `;

  const checkIfConstraintExistSql = ` SELECT Constraint_exists("${tableName2}", "${constraint1}") as exist;`;

  const checkIfConstraintIfExistSql = ` SELECT Constraint_exists("${tableName2}", "unknown") as exist;`;
  const dropFKExistSql = ` SELECT Constraint_exists("${tableName2}",  "${constraint2}") as exist;`;
  const dropForeignKeySql = ` CALL drop_foreign_key("${tableName2}", "${constraint2}");`;
  const dropUnknownForeignKeySql = ` CALL drop_foreign_key("${tableName2}", "unknown");`;
  const dropUnknownColumnSql = ` CALL drop_column_if_exists("${tableName2}", "unknown");`;
  const dropColumnSql = ` CALL drop_column_if_exists("${tableName2}", "uuid_parent2");`;
  const checkIfColumnExistSql = ` SELECT bh_column_exists("${tableName2}", "uuid_parent2") as exist;`;

  const checkIfIndexExistSql = ` SELECT index_exists("${tableName2}", "type") as exist;`;
  const dropUnknownIndexSql = ` CALL drop_index_if_exists("${tableName2}", "unknown");`;
  const dropIndexSql = ` CALL drop_index_if_exists("${tableName2}", "type");`;

  it('#should create the test table1', async () => {
    const res = await db.exec(createTable1Sql);
    expect(!!res).to.equal(true);
  });

  it('#should create the test table2', async () => {
    const res = await db.exec(createTable2Sql);
    expect(!!res).to.equal(true);
  });

  it('#check if a constraint exist', async () => {
    const row = await db.one(checkIfConstraintExistSql);
    expect(row.exist).to.equal(1);
  });

  it('#check if a constraint doestn\'t exist', async () => {
    const row = await db.one(checkIfConstraintIfExistSql);
    expect(row.exist).to.equal(0);
  });

  it('#drop a foreign key by calling drop_foreign_key', async () => {
    const res = await db.exec(dropForeignKeySql);
    expect(!!res).to.equal(true);
  });

  it('#drop a no existing foreign key by calling drop_foreign_key', async () => {
    const res = await db.exec(dropUnknownForeignKeySql);
    expect(!!res).to.equal(true);
  });

  it('#check if a dropped column doesnt exist', async () => {
    const row = await db.one(dropFKExistSql);
    expect(row.exist).to.equal(0);
  });

  it('#check if a column exists', async () => {
    const row = await db.one(checkIfColumnExistSql);
    expect(row.exist).to.equal(1);
  });

  it('#drop a no existing column  by calling drop_column_if_exists', async () => {
    const res = await db.exec(dropUnknownColumnSql);
    expect(!!res).to.equal(true);
  });

  it('#drop an existing column  by calling drop_column_if_exists', async () => {
    const res = await db.exec(dropColumnSql);
    expect(!!res).to.equal(true);
  });

  it('#check if a column has really been removed', async () => {
    const row = await db.one(checkIfColumnExistSql);
    expect(row.exist).to.equal(0);
  });

  it('#check if an index exists in a table', async () => {
    const row = await db.one(checkIfIndexExistSql);
    expect(row.exist).to.equal(1);
  });

  it('#drop a no existing index  by calling drop_index_if_exists', async () => {
    await db.exec(dropUnknownIndexSql);
    expect(true).to.equal(true);
  });

  it('#drop an existing index  by calling drop_index_if_exists', async () => {
    const res = await db.exec(dropIndexSql);
    expect(!!res).to.equal(true);
  });

  it('#check if the index has really been removed', async () => {
    const row = await db.one(checkIfIndexExistSql);
    expect(row.exist).to.equal(0);
  });

  before(async () => {
    await db.exec(`DROP TABLE  IF EXISTS ${tableName1};`);
    await db.exec(`DROP TABLE  IF EXISTS ${tableName2};`);
  });

}

describe('lib/db/function.sql.js', DatabaseUnitTests);

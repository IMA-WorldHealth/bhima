/**
 * @module controllers/finance/creditors
 *
 * @description
 * This file contains lookup routes for creditors, as needed by the complex
 * journal vouchers page.
 *
 * @todo - this page is lacking integration tests
 *
 * @requires db
 * @requires NotFound
 */

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

exports.list = list;
exports.detail = detail;

/**
 * GET /creditors
 * @todo integration tests for this function
 */
function list(req, res, next) {
  const sql = `
    SELECT BUID(c.uuid) as uuid, c.text, cg.name, BUID(c.group_uuid) as group_uuid,
      a.id AS account_id, a.number, map.text as hr_entity
    FROM creditor AS c 
    JOIN creditor_group AS cg 
    JOIN account AS a ON c.group_uuid = cg.uuid AND cg.account_id = a.id 
    LEFT JOIN entity_map map ON map.uuid = c.uuid;
  `;

  db.exec(sql)
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * GET /creditors/:uuid
 * @todo integration tests for this function
 */
function detail(req, res, next) {
  const sql = `
    SELECT BUID(c.uuid) as uuid, c.text, cg.name, BUID(c.group_uuid) as group_uuid,
      a.id AS account_id, a.number
    FROM creditor AS c JOIN creditor_group AS cg JOIN account AS a
      ON c.group_uuid = cg.uuid AND cg.account_id = a.id
    WHERE c.uuid = ?;
  `;

  db.exec(sql, [db.bid(req.params.uuid)])
  .then((rows) => {
    if (!rows.length) {
      throw new NotFound(
        `Could not find creditor with uuid ${req.params.uuid}.`
      );
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
}

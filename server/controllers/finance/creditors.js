const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');

/**
 * GET /creditors
 * @todo integration tests for this function
 */
exports.list = function list(req, res, next) {
  'use strict';

  var sql =
    `SELECT BUID(c.uuid) as uuid, c.text, cg.name, BUID(c.group_uuid) as group_uuid,
      a.id AS account_id, a.number
    FROM creditor AS c JOIN creditor_group AS cg JOIN account AS a
      ON c.group_uuid = cg.uuid AND cg.account_id = a.id;`;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
 * GET /creditors/:uuid
 * @todo integration tests for this function
 */
exports.detail = function detail(req, res, next) {
  'use strict';

  var sql =
    `SELECT BUID(c.uuid) as uuid, c.text, cg.name, BUID(c.group_uuid) as group_uuid,
      a.id AS account_id, a.number
    FROM creditor AS c JOIN creditor_group AS cg JOIN account AS a
      ON c.group_uuid = cg.uuid AND cg.account_id = a.id
    WHERE c.uuid = ?`;

  db.exec(sql, [db.bid(req.params.uuid)])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound(
        `Could not find creditor with uuid ${req.params.uuid}`
      );
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

var db = require('../../lib/db');

function list (req, res, next) {
  'use strict';
  var sql =
    'SELECT p.id, p.text FROM profit_center AS p';

  if (req.query.full === '1') {

    sql =
      'SELECT p.id, p.text, p.project_id, p.note, pr.name, pr.abbr, pr.enterprise_id, pr.zs_id ' +
      'FROM profit_center AS p JOIN project AS pr ON p.project_id = pr.id';
  }

  sql += ' ORDER BY p.text;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create (req, res, next) {
  'use strict';

  var record = req.body;
  var createProfitCenterQuery = 'INSERT INTO profit_center SET ?';

  delete record.id;

  db.exec(createProfitCenterQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

function update(req, res, next) {
  'use strict';

  var queryData = req.body;
  var profitCenterId = req.params.id;
  var updateProfitCenterQuery = 'UPDATE profit_center SET ? WHERE id = ?';

  delete queryData.id;

  lookupProfitCenter(profitCenterId, req.codes)
    .then(function () {
      return db.exec(updateProfitCenterQuery, [queryData, profitCenterId]);
    })
    .then(function (result) {
      return lookupProfitCenter(profitCenterId, req.codes);
    })
    .then(function (profitCenter) {
      res.status(200).json(profitCenter);
    })
    .catch(next)
    .done();
}

function remove(req, res, next) {
  var profitCenterId = req.params.id;
  var removeProfitCenterQuery = 'DELETE FROM profit_center WHERE id=?';

  lookupProfitCenter(profitCenterId, req.codes)
    .then(function () {
      return db.exec(removeProfitCenterQuery, [profitCenterId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

function detail(req, res, next) {
  'use strict';

  lookupProfitCenter(req.params.id, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

function lookupProfitCenter (id, codes) {
  'use strict';

  var sql =
    'SELECT p.id, p.text, p.note, p.project_id FROM profit_center AS p WHERE p.id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new codes.ERR_NOT_FOUND();
      }
      return rows[0];
    });
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;

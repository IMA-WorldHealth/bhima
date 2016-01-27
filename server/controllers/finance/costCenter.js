var db = require('../../lib/db');

function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT c.id, c.text FROM cost_center AS c';

  if (req.query.full === '1') {
    sql =
      'SELECT c.id, c.text, c.project_id, c.note, c.is_principal, p.name, p.abbr, p.enterprise_id, p.zs_id ' +
      'FROM cost_center AS c JOIN project AS p ON c.project_id = p.id';
  }

  sql += ' ORDER BY c.text;';

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
  var createCostCenterQuery = 'INSERT INTO cost_center SET ?';

  delete record.id;

  db.exec(createCostCenterQuery, [record])
    .then(function (result) {
      res.status(201).json({ id: result.insertId });
    })
    .catch(next)
    .done();
}

function update (req, res, next) {
  'use strict';

  var queryData = req.body;
  var costCenterId = req.params.id;
  var updateCostCenterQuery = 'UPDATE cost_center SET ? WHERE id = ?';

  delete queryData.id;

  lookupCostCenter(costCenterId, req.codes)
    .then(function () {
      return db.exec(updateCostCenterQuery, [queryData, costCenterId]);
    })
    .then(function (result) {
      return lookupCostCenter(costCenterId, req.codes);
    })
    .then(function (costCenter) {
      res.status(200).json(costCenter);
    })
    .catch(next)
    .done();
}

function remove (req, res, next) {
  var costCenterId = req.params.id;
  var removeCostCenterQuery = 'DELETE FROM cost_center WHERE id=?';

  lookupCostCenter(costCenterId, req.codes)
    .then(function () {
      return db.exec(removeCostCenterQuery, [costCenterId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

function detail(req, res, next) {
  'use strict';

  lookupCostCenter(req.params.id, req.codes)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

function lookupCostCenter(id, codes) {
  'use strict';

  var sql =
    'SELECT cc.id, cc.text, cc.note, cc.is_principal, cc.project_id FROM cost_center AS cc WHERE cc.id = ?';

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

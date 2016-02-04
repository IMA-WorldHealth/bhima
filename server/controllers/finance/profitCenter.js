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

  if(req.query.availableOnly === '1') {
    sql += ' WHERE p.id NOT IN (SELECT s.profit_center_id FROM service AS s WHERE NOT ISNULL(s.profit_center_id))';
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


/**
* METHOD : GET
* FUNCTION : getProfitValue
* ARG : 
*      - req contains a id of profit center
*      - res will contain the result to send to the client
*      - next will pass the control to an other middleware
* DESCRIPTION : This funtion receive an profit center id and send back his value, by scanning the general
*               table and by considering account which are directly tailed to it.
**/

function getProfitValue (req, res, next){

  var sql = null, optionalCondition = '';

  lookupProfitCenter(req.params.id, req.codes)
    .then(function (){      
      sql = 
        'SELECT ac.id FROM account AS ac WHERE ac.pc_id=? AND ac.is_title =?';

      return db.exec(sql, [req.params.id, 0]);
    })
    .then(function (rows){
      if (rows.length > 0) {
        rows = rows.map(function (row) { return row.id;});
        optionalCondition = ' OR %table%.account_id IN (' + rows.join(',') + ')';
      }

      sql =
        'SELECT SUM(t.credit_equiv - t.debit_equiv) as profit ' +
        'FROM (SELECT gl.debit_equiv, gl.credit_equiv FROM general_ledger AS gl LEFT JOIN ' +
        'profit_center AS pc ON gl.pc_id = pc.id WHERE gl.pc_id=? ' + (optionalCondition.replace('%table%', 'gl')) + ') ' +
        'AS t';

      return db.exec(sql, [req.params.id, req.params.id]);
    })
    .then(function (result){
      res.status(200).json(result[0]);
    })
    .catch(next)
    .done();
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;
exports.getProfitValue = getProfitValue;
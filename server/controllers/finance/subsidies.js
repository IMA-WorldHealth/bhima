var db = require('../../lib/db');
var NotFound = require('../../lib/errors/NotFound');

function lookupSubsidy(id, codes) {
  'use strict';

  var sql =
    'SELECT id, account_id, label, description, value, created_at, updated_at FROM subsidy WHERE id = ?';

  return db.exec(sql, id)
    .then(function (rows) {
      if (rows.length === 0) {
        throw new NotFound(`Could not find a subsidy with id ${id}`);
      }
      return rows[0];
    });
}

function detail(req, res, next) {
  'use strict';

  lookupSubsidy(req.params.id, req.codes)
  .then(function (row) {
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}

function list(req, res, next) {
  'use strict';
  var sql;

  if (req.query.detailed === '1') {
    sql = 
      'SELECT subsidy.id, subsidy.account_id, subsidy.label, subsidy.description, subsidy.value, subsidy.created_at, ' +
      'subsidy.updated_at, account.number ' +
      'FROM subsidy ' +
      'JOIN account ON account.id = subsidy.account_id';       
  } else {
    sql =
      'SELECT id, label, value FROM subsidy';
  }  

  var sql =


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
  var createSubsidyQuery = 'INSERT INTO subsidy SET ?';

  delete record.id;

  try {
    checkData(record, req.codes);
  } catch (err) {
    return next(err);
  }

  db.exec(createSubsidyQuery, [record])
  .then(function (result) {
    res.status(201).json({id : result.insertId});
  })
  .catch(next)
  .done();
}

function update(req, res, next) {
  'use strict';

  var queryData = req.body;
  var subsidyId = req.params.id;
  var updateSubsidyQuery = 'UPDATE subsidy SET ? WHERE id = ?';

  delete queryData.id;

  try {
    checkData(queryData, req.codes);
  } catch (err) {
    return next(err);
  }

  lookupSubsidy(subsidyId, req.codes)
  .then(function () {
    return db.exec(updateSubsidyQuery, [queryData, subsidyId]);
  })
  .then(function () {
    return lookupSubsidy(subsidyId, req.codes);
  })
  .then(function (subsidy) {
    res.status(200).json(subsidy);
  })
  .catch(next)
  .done();
}

function remove(req, res, next) {

  var subsidyId = req.params.id;
  var removeSubsidyQuery = 'DELETE FROM subsidy WHERE id = ?';

  lookupSubsidy(subsidyId, req.codes)
    .then(function () {
      return db.exec(removeSubsidyQuery, [subsidyId]);
    })
    .then(function () {
      res.status(204).send();
    })
    .catch(next)
    .done();
}

function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

function checkData (obj, codes) {
  if (isEmptyObject(obj)) { throw new codes.ERR_EMPTY_BODY();}
  if (!obj.value) { throw new codes.ERR_PARAMETERS_REQUIRED();}
  if (obj.value <= 0) { throw new codes.ERR_BAD_VALUE();}
  if (isNaN(obj.value)) { throw new codes.ERR_BAD_VALUE();}
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;

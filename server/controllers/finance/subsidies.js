'use strict';

const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');
const NotFound = require('../../lib/errors/NotFound');

function lookupSubsidy(id) {
  const sql = `
    SELECT id, account_id, label, description, value, created_at, updated_at
    FROM subsidy WHERE id = ?;
  `;

  return db.one(sql, id, id, 'subsidy');
}

function detail(req, res, next) {
  lookupSubsidy(req.params.id)
    .then(function (row) {
      res.status(200).json(row);
    })
    .catch(next)
    .done();
}

function list(req, res, next) {
  let sql;

  if (req.query.detailed === '1') {
    sql =
      `SELECT subsidy.id, subsidy.account_id, subsidy.label, subsidy.description, subsidy.value, subsidy.created_at,
      subsidy.updated_at, account.number
      FROM subsidy
      JOIN account ON account.id = subsidy.account_id`;
  } else {
    sql =
      'SELECT id, label, value FROM subsidy';
  }

 db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

function create(req, res, next) {
  let record = req.body;
  let createSubsidyQuery = 'INSERT INTO subsidy SET ?';

  delete record.id;

  try {
    checkData(record);
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
  let queryData = req.body;
  let subsidyId = req.params.id;
  let updateSubsidyQuery = 'UPDATE subsidy SET ? WHERE id = ?';

  delete queryData.id;

  try {
    checkData(queryData);
  } catch (err) {
    return next(err);
  }

  lookupSubsidy(subsidyId)
  .then(function () {
    return db.exec(updateSubsidyQuery, [queryData, subsidyId]);
  })
  .then(function () {
    return lookupSubsidy(subsidyId);
  })
  .then(function (subsidy) {
    res.status(200).json(subsidy);
  })
  .catch(next)
  .done();
}

function remove(req, res, next) {
  const subsidyId = req.params.id;
  const removeSubsidyQuery = 'DELETE FROM subsidy WHERE id = ?';

  lookupSubsidy(subsidyId)
    .then(() => db.exec(removeSubsidyQuery, [subsidyId]))
    .then(() => res.sendStatus(204))
    .catch(next)
    .done();
}

function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

function checkData (obj) {
  if (isEmptyObject(obj)) { throw new BadRequest(`You cannot submit a PUT/POST request with an empty body to the server.`, `ERRORS.EMPTY_BODY`);}
  if (!obj.value) { throw new BadRequest(`The request requires at least one parameter.`, `ERRORS.PARAMETERS_REQUIRED`);}
  if (obj.value <= 0) { throw new BadRequest(`You sent a bad value for some parameters`,  `ERRORS.BAD_VALUE`);}
  if (isNaN(obj.value)) { throw new BadRequest(`You sent a bad value for some parameters`, `ERRORS.BAD_VALUE`);}
}

exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.detail = detail;

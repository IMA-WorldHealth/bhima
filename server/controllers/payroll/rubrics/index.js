/**
* Rubric Controller
*
* This controller exposes an API to the client for reading and writing Rubric
*/
const q = require('q');
const _ = require('lodash');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const FilterParser = require('../../../lib/filter');

// GET /Rubric
function lookupRubric(id) {
  const sql = `
    SELECT r.id, r.label, r.abbr, r.is_employee, r.is_percent, r.is_defined_employee, r.is_discount, r.is_social_care,
    r.debtor_account_id, r.expense_account_id, r.is_ipr, r.value, r.is_tax, r.is_membership_fee,
    r.is_associated_employee, r.is_seniority_bonus, r.position, r.is_monetary_value, is_sum_of_rubrics,  r.is_family_allowances
    FROM rubric_payroll AS r
    WHERE r.id = ? ORDER BY r.label ASC`;

  return db.one(sql, [id]);
}

async function lookupRubricItem(id) {
  const sql = 'SELECT item_id FROM rubric_payroll_item WHERE rubric_payroll_id=?';
  const items = await db.exec(sql, id);
  const rubrics = [];
  items.forEach(item => {
    rubrics.push(item.item_id);
  });
  return rubrics;
}
// Lists the Payroll Rubrics
function list(req, res, next) {
  const filters = new FilterParser(req.query, { tableAlias : 'r' });

  const sql = `
    SELECT r.id, UPPER(r.label) AS label, r.abbr, r.is_employee, r.is_percent, r.is_defined_employee, 
      r.is_discount, r.is_social_care,
      r.debtor_account_id, a4.number AS four_number, a4.label AS four_label,
      r.expense_account_id, a6.number AS six_number, a6.label AS six_label, r.is_ipr, r.value, r.is_tax,
      r.is_membership_fee, r.is_associated_employee, r.is_seniority_bonus, r.is_family_allowances,
      r.is_monetary_value, is_sum_of_rubrics, r.position
    FROM rubric_payroll AS r
    LEFT JOIN account AS a4 ON a4.id = r.debtor_account_id
    LEFT JOIN account AS a6 ON a6.id = r.expense_account_id
  `;

  filters.equals('is_defined_employee');
  filters.setOrder('ORDER BY r.label');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /Rubric/:ID
*
* Returns the detail of a single Rubric
*/
function detail(req, res, next) {
  const { id } = req.params;
  let rubricDetail = {};
  lookupRubric(id)
    .then((record) => {
      rubricDetail = record;
      return lookupRubricItem(id);
    }).then(rubrics => {
      rubricDetail.rubrics = rubrics;
      res.status(200).json(rubricDetail);
    })
    .catch(next)
    .done();
}

// POST /Rubric
function create(req, res, next) {

  const sql = `INSERT INTO rubric_payroll SET ?`;
  const data = req.body;
  const items = [].concat(_.clone(data.rubrics));
  delete data.rubrics;
  let insertedId = null;

  db.exec(sql, [data]).then(result => {
    insertedId = result.insertId;
    return q.all(items.map(itemId => {
      const record = {
        uuid : db.uuid(),
        rubric_payroll_id : insertedId,
        item_id : itemId,
      };
      return db.exec('INSERT INTO rubric_payroll_item SET ?', record);
    }));
  }).then(() => {
    res.status(201).json({ id : insertedId });
  }).catch(next);
}


// PUT /Rubric /:id
function update(req, res, next) {
  const sql = `UPDATE rubric_payroll SET ? WHERE id = ?;`;
  const data = req.body;
  const items = [].concat(_.clone(data.rubrics));
  delete data.rubrics;

  let rubricDetail = {};
  const rubricPayrollId = req.params.id;
  db.exec(sql, [req.body, rubricPayrollId]).then(() => {
    const transaction = db.transaction();
    transaction.addQuery('DELETE FROM rubric_payroll_item WHERE ?', {
      rubric_payroll_id : rubricPayrollId,
    });
    items.forEach(itemId => {
      const record = {
        uuid : db.uuid(),
        rubric_payroll_id : rubricPayrollId,
        item_id : itemId,
      };
      transaction.addQuery('INSERT INTO rubric_payroll_item SET ?', record);
    });
    return transaction.execute();
  }).then(() => {
    return lookupRubric(rubricPayrollId);
  }).then(record => {
    rubricDetail = record;
    return lookupRubricItem(rubricPayrollId);
  })
    .then(_rubrics => {
      rubricDetail.rubrics = _rubrics;
      res.status(200).json(rubricDetail);
    })
    .catch(next);
}

// DELETE /Rubric/:id
function del(req, res, next) {
  const sql = `DELETE FROM rubric_payroll WHERE id = ?;`;

  db.exec(sql, [req.params.id])
    .then((row) => {
    // if nothing happened, let the client know via a 404 error
      if (row.affectedRows === 0) {
        throw new NotFound(`Could not find a Rubric with id ${req.params.id}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of Rubric
exports.list = list;

// get details of a Rubric
exports.detail = detail;

// create a new Rubric
exports.create = create;

// update Rubric informations
exports.update = update;

// Delete a Rubric
exports.delete = del;

/**
* Fee Center Controller
*
* This controller exposes an API to the client for reading and writing Fee Center
*/

const db = require('../../lib/db');
const NotFound = require('../../lib/errors/NotFound');
const q = require('q');

// GET /fee_center
function lookupFeeCenter(id) {

  const sqlFeeCenter = `
    SELECT id, label, is_principal FROM fee_center WHERE id = ?`;

  const sqlReferenceFeeCenter = `
    SELECT id, fee_center_id, account_reference_id, is_cost 
    FROM reference_fee_center 
    WHERE fee_center_id = ?`;

  const sqlProjectsFeeCenter = `
    SELECT id, fee_center_id, project_id FROM project_fee_center WHERE fee_center_id = ?`;

  return q.all([
    db.exec(sqlFeeCenter, [id]),
    db.exec(sqlReferenceFeeCenter, [id]),
    db.exec(sqlProjectsFeeCenter, [id]),
  ])
  .spread((feeCenter, references, projectsFeeCenter) => {
    const projects = projectsFeeCenter.map(project => project.project_id);

    const data = {
      feeCenter,
      references,
      projects,
    };

    return data;
  });
}

// Lists
function list(req, res, next) {
  const sql = `SELECT id, label, is_principal FROM fee_center;`;

  db.exec(sql)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch(next)
    .done();
}

/**
* GET /fee_center/:ID
*
* Returns the detail of a single fee_center
*/
function detail(req, res, next) {
  const { id } = req.params;

  lookupFeeCenter(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}


// POST /fee_center
function create(req, res, next) {
  const sql = `INSERT INTO fee_center SET ?`;
  const data = req.body;

  const feeCenterData = {
    label : data.label,
    is_principal : data.is_principal,
  };

  db.exec(sql, [feeCenterData])
    .then((row) => {
      const feeCenterId = row.insertId;
      const dataReferences = [];
      const dataProjects = [];

      if (data.reference_fee_center) {
        data.reference_fee_center.forEach(item => {
          dataReferences.push([
            feeCenterId,
            item.account_reference_id,
            item.is_cost,
          ]);
        });
      }

      if (data.projects) {
        data.projects.forEach(item => {
          dataProjects.push([
            feeCenterId,
            item,
          ]);
        });
      }

      const transaction = db.transaction();

      if (data.reference_fee_center.length) {
        const sqlReferences = `
          INSERT INTO reference_fee_center (fee_center_id, account_reference_id, is_cost) VALUES ?`;

        transaction
          .addQuery(sqlReferences, [dataReferences]);
      }

      if (dataProjects.length) {
        const sqlProjects = `
          INSERT INTO project_fee_center (fee_center_id, project_id) VALUES ?`;
        transaction
          .addQuery(sqlProjects, [dataProjects]);
      }

      return transaction.execute();
    })
    .then((rows) => {
      res.status(201).json(rows);
    })
    .catch(next)
    .done();
}


// PUT /fee_center /:id
function update(req, res, next) {
  const data = req.body;
  const transaction = db.transaction();

  const feeCenterData = {
    label : data.label,
    is_principal : data.is_principal,
  };

  const sql = `UPDATE fee_center SET ? WHERE id = ?;`;
  const delReferences = `DELETE FROM reference_fee_center WHERE fee_center_id = ?;`;
  const delProjects = `DELETE FROM project_fee_center WHERE fee_center_id = ?;`;

  const feeCenterId = req.params.id;
  const dataReferences = [];
  const dataProjects = [];

  if (data.reference_fee_center) {
    data.reference_fee_center.forEach(item => {
      dataReferences.push([
        feeCenterId,
        item.account_reference_id,
        item.is_cost,
      ]);
    });
  }

  if (data.projects) {
    data.projects.forEach(item => {
      dataProjects.push([
        feeCenterId,
        item,
      ]);
    });
  }

  transaction
    .addQuery(sql, [feeCenterData, feeCenterId])
    .addQuery(delReferences, [feeCenterId])
    .addQuery(delProjects, [feeCenterId]);

  if (data.reference_fee_center.length) {
    const sqlReferences = `
      INSERT INTO reference_fee_center (fee_center_id, account_reference_id, is_cost) VALUES ?`;

    transaction
      .addQuery(sqlReferences, [dataReferences]);
  }

  if (dataProjects.length) {
    const sqlProjects = `
      INSERT INTO project_fee_center (fee_center_id, project_id) VALUES ?`;
    transaction
      .addQuery(sqlProjects, [dataProjects]);
  }

  return transaction.execute()
    .then(() => {
      return lookupFeeCenter(feeCenterId);
    })
    .then((record) => {
      // all updates completed successfull, return full object to client
      res.status(200).json(record);
    })
    .catch(next)
    .done();
}

// DELETE /fee_center/:id
function del(req, res, next) {
  const transaction = db.transaction();
  const feeCenterId = req.params.id;

  const sql = `DELETE FROM fee_center WHERE id = ?;`;
  const delReferences = `DELETE FROM reference_fee_center WHERE fee_center_id = ?;`;
  const delProjects = `DELETE FROM project_fee_center WHERE fee_center_id = ?;`;

  transaction
    .addQuery(delReferences, [feeCenterId])
    .addQuery(delProjects, [feeCenterId])
    .addQuery(sql, [feeCenterId]);

  transaction.execute()
    .then((rows) => {
      // if nothing happened, let the client know via a 404 error
      if (rows[0].affectedRows === 0) {
        throw new NotFound(`Could not find a Fee Center with id ${feeCenterId}`);
      }

      res.status(204).json();
    })
    .catch(next)
    .done();
}

// get list of feeCenter
exports.list = list;

// get details of a feeCenter
exports.detail = detail;

// create a new feeCenter
exports.create = create;

// update feeCenter informations
exports.update = update;

// Delete a feeCenter
exports.delete = del;


/**
 * @method find
 *
 * @description
 * This method will apply filters from the options object passed in to
 * filter.
 */
const db = require('../../../lib/db');

// get staffing indice parameters
function detail(req, res, next) {
  const sql = `
    SELECT BUID(uuid) as uuid, pay_envelope, working_days, payroll_configuration_id
    FROM staffing_indice_parameters
    WHERE payroll_configuration_id =?
  `;
  const id = req.params.payroll_config_id;
  db.one(sql, id).then(param => {
    res.status(200).json(param);
  }).catch(next);
}

// settup staffing indice parameters
function create(req, res, next) {
  const data = req.body;
  data.uuid = db.uuid();
  const id = req.body.payroll_configuration_id;
  const transaction = db.transaction();

  transaction.addQuery('DELETE FROM staffing_indice_parameters WHERE payroll_configuration_id =?', id);
  transaction.addQuery('INSERT INTO staffing_indice_parameters SET ?', data);
  transaction.addQuery('CALL updateIndices(?)', id);
  transaction.execute().then(() => {
    res.sendStatus(201);
  }).catch(next);
}

module.exports.detail = detail;
module.exports.create = create;

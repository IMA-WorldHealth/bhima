/**
 * @overview server/controllers/finance/patient.js
 *
 * @description
 * Return patient balance
 *
 * @requires lodash
 * @requires Patient
 */

const Patient = require('./reports/financial.patient');

/**
 * @method patientBalance
 * Return the patient balance status
 */
function patientBalance(req, res, next) {
  Patient.financialActivities(req.params.uuid)
    .then((result) => {
      const balance = result.aggregates && result.aggregates.balance ? result.aggregates.balance : null;
      res.status(200).json(balance);
    })
    .catch(next)
    .done();
}

exports.balance = patientBalance;

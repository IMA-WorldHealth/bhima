/**
 * @overview server/controllers/finance/patient.js
 *
 * @description
 * Return patient balance
 *
 * @requires lodash
 * @requires Patient
 */
'use strict';

const _ = require('lodash');

const Patient = require('./reports/financial.patient');

/**
 * @method patientBalance
 * Return the patient balance status
 */
function patientBalance(req, res, next) {

  Patient.financialActivities(req.params.uuid)
    .then(result => {
      let balance = result.sum && result.sum.balance ? result.sum.balance : null;
      res.status(200).json(balance);
    })
    .catch(next)
    .done();
}

exports.balance = patientBalance;

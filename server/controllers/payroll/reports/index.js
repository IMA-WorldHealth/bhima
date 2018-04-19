/**
 * @overview payroll/reports
 *
 * @description
 * This module simply exposes interfaces for employee reports
 * in the payroll module.
 */

const employeeRegistration = require('./registrations');
const employeeMultiPayroll = require('./multipayroll');
const payslipGenerator = require('./payslipGenerator');

// expose to the express router
module.exports = {
  employeeRegistrations : employeeRegistration,
  employeeMultiPayroll,
  payslipGenerator,
};

/**
 * @overview
 * User report
 *
 * @description
 * This module contains all the code for rendering PDFs of user
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const userCtrl = require('../index');

const REPORT_TEMPLATE = './server/controllers/admin/users/reports/report.handlebars';

exports.report = report;

/**
 * GET users/report
 *
 * @method report
 */
async function report(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'USERS.TITLE',
    orientation : 'landscape',
    csvKey : 'rows',
    suppressDefaultFiltering : true,
    suppressDefaultFormatting : false,
  });
  console.log('USER :', options);
  try {
    const rm = new ReportManager(REPORT_TEMPLATE, req.session, options);
    const rows = await userCtrl.fetchUser(options);

    const result = await rm.render({ rows });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }

}

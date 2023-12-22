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
const shared = require('../../../finance/reports/shared');

const REPORT_TEMPLATE = './server/controllers/admin/users/reports/report.handlebars';

exports.report = report;

/**
 * GET reports/user
 *
 * @method report
 */
async function report(req, res, next) {
  const options = _.extend(req.query, {
    filename : 'USERS.TITLE',
    orientation : 'landscape',
    csvKey : 'rows',
    suppressDefaultFiltering : false,
    suppressDefaultFormatting : false,
  });
  const filters = shared.formatFilters(options);
  try {
    const rm = new ReportManager(REPORT_TEMPLATE, req.session, options);
    const rows = await userCtrl.fetchUser(options);
    const result = await rm.render({ rows, filters });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }

}

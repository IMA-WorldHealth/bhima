const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const ccAllocations = require('../../cost_center_allocation_registry');

const TEMPLATE = './server/controllers/finance/reports/cost_center_step_down/report.handlebars';

// expose to the API
exports.report = document;

/**
 * @function reporting
 *
 * @description
 * Renders the fee center report
 *
 * @param {*} options the report options
 * @param {*} session the session
 */
async function buildReport(params, session) {
  const options = _.extend(params, {
    filename : 'TREE.COST_CENTER_STEPDOWN',
    csvKey : 'rows',
    user : session.user,
  });

  const report = new ReportManager(TEMPLATE, session, options);

  const context = await ccAllocations.fetch(session, params);

  return report.render(context);
}

function document(req, res, next) {
  buildReport(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

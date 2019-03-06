/**
 * Visits Report
 */
const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');
const FilterParser = require('../../../lib/filter');

// path to the template to render
const TEMPLATE = './server/controllers/medical/reports/visits.report.handlebars';

exports.document = document;

function document(req, res, next) {
  const options = req.query;

  let report;
  try {
    report = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  getData(options)
    .then(rows => report.render(rows))
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

function getData(options) {
  db.convert(options, ['uuid', 'patient_uuid', 'ward_uuid', 'room_uuid']);
  // const filters = new FilterParser(options);
  const query = `SELECT s.name AS service_name,
    (SELECT COUNT(*) FROM patient_visit JOIN )
  `;
}

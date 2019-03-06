/**
 * Visits Report
 */
const _ = require('lodash');
const moment = require('moment');
const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');

// path to the template to render
const TEMPLATE = './server/controllers/medical/reports/visits.report.handlebars';

exports.document = document;

function document(req, res, next) {
  let report;
  let details;

  const params = req.query;

  const optionReport = _.extend(params, {
    filename : 'PATIENT_RECORDS.REPORT.VISITS',
  });

  try {
    details = req.query.params ? JSON.parse(req.query.params) : {};
    report = new ReportManager(TEMPLATE, req.session, optionReport);
  } catch (e) {
    next(e);
    return;
  }

  getData(details)
    .then(visits => report.render({ visits, details }))
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

function getData(options) {
  const baseQuery = `
    SELECT COUNT(*) FROM patient_visit pv
    JOIN patient_visit_service pvs ON pvs.patient_visit_uuid = pv.uuid 
  `;

  options.dateFrom = moment(options.dateFrom).format('YYYY-MM-DD');
  options.dateTo = moment(options.dateTo).format('YYYY-MM-DD');

  const totalVisit = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?))) AS total
  `;

  const totalNewCase = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND is_new_case = 1) AS total_new_case
  `;

  const totalOldCase = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND is_new_case = 0) AS total_old_case
  `;

  const totalPregnant = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND is_pregnant = 1) AS total_pregnant
  `;

  const totalReferred = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND is_refered = 1) AS total_referred
  `;

  const totalHospitalized = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND hospitalized = 1) AS total_hospitalized
  `;

  const totalAmbulatory = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?))
      AND hospitalized = 0) AS total_ambulatory
  `;

  const totalInsideHZ = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?)) 
      AND inside_health_zone = 1) AS total_inside_health_zone
  `;

  const totalOutsideHZ = `
    (${baseQuery} WHERE pvs.service_id = s.id AND (pvs.created_at BETWEEN DATE(?) AND DATE(?))
      AND inside_health_zone = 0) AS total_outside_health_zone
  `;

  const queryParams = [
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
    options.dateFrom, options.dateTo,
  ];

  const query = `
    SELECT s.name AS service_name,
      ${totalVisit},
      ${totalNewCase},
      ${totalOldCase},
      ${totalPregnant},
      ${totalReferred},
      ${totalHospitalized},
      ${totalAmbulatory},
      ${totalInsideHZ},
      ${totalOutsideHZ}
    FROM service s;
  `;
  return db.exec(query, queryParams);
}

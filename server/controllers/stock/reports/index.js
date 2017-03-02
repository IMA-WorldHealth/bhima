'use strict';

/**
 * @overview
 * Stock Reports
 *
 * This module is responsible for rendering reports of stock. 
 *
 * @module stock/reports/
 */

const _ = require('lodash');
const db = require('../../../lib/db');
const identifiers = require('../../../config/identifiers');
const NotFound = require('../../../lib/errors/NotFound');
const ReportManager = require('../../../lib/ReportManager');

const Stock = require('../core');

// receipts
const STOCK_EXIT_PATIENT_TEMPLATE = './server/controllers/stock/reports/stock_exit_patient.receipt.handlebars';
const STOCK_EXIT_SERVICE_TEMPLATE = './server/controllers/stock/reports/stock_exit_service.receipt.handlebars';
const STOCK_EXIT_DEPOT_TEMPLATE = './server/controllers/stock/reports/stock_exit_depot.receipt.handlebars';
const STOCK_EXIT_LOSS_TEMPLATE = './server/controllers/stock/reports/stock_exit_loss.receipt.handlebars';

// reports
const STOCK_LOTS_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_lots.report.handlebars';
const STOCK_MOVEMENTS_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_movements.report.handlebars';
const STOCK_INVENTORIES_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_inventories.report.handlebars';

// ===================================== receipts ========================================

/**
 * @method stockExitPatientReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_patient/:document_uuid
 */
function stockExitPatientReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.REPORTS.EXIT_PATIENT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_PATIENT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name, p.display_name AS patient_display_name, 
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS patient_reference, p.hospital_no,
      l.label, l.expiration_date 
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN patient p ON p.uuid = m.entity_uuid 
    JOIN project proj ON proj.id = p.project_id 
    JOIN user u ON u.id = m.user_id 
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_PATIENT} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        patient_reference    : line.patient_reference,
        patient_display_name : line.patient_display_name,
        hospital_no          : line.hospital_no,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
      };

      data.rows = rows;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// ================================== end receipts ======================================

/**
 * @method stockLotsReport
 *
 * @description
 * This method builds the stock lots report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/lots
 */
function stockLotsReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;

  const data = {};
  let report;
  const optionReport = _.extend(req.query, { filename: 'TREE.STOCK_LOTS', orientation: 'landscape'});

  // set up the report with report manager
  try {

    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
    }

    report = new ReportManager(STOCK_LOTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getLotsDepot(null, options)
    .then((rows) => {

      data.rows = rows;
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method stockMovementsReport
 *
 * @description
 * This method builds the stock movements report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/movements
 */
function stockMovementsReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;

  const data = {};
  let report;
  const optionReport = _.extend(req.query, { filename: 'TREE.STOCK_MOVEMENTS', orientation: 'landscape'});

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
    }

    report = new ReportManager(STOCK_MOVEMENTS_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getLotsMovements(null, options)
    .then((rows) => {

      data.rows = rows;
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method stockInventoriesReport
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventories
 */
function stockInventoriesReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;

  const data = {};
  let report;
  const optionReport = _.extend(req.query, { filename: 'TREE.STOCK_INVENTORY', orientation: 'landscape'});

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
    }

    report = new ReportManager(STOCK_INVENTORIES_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getLotsDepot(null, options, ' GROUP BY l.inventory_uuid ')
    .then((rows) => {

      data.rows = rows;
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// expose to the api
exports.stockLotsReport = stockLotsReport;
exports.stockMovementsReport = stockMovementsReport;
exports.stockInventoriesReport = stockInventoriesReport;
exports.stockExitPatientReceipt = stockExitPatientReceipt;

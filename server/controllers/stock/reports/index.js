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

const STOCK_ENTRY_DEPOT_TEMPLATE = './server/controllers/stock/reports/stock_entry_depot.receipt.handlebars';
const STOCK_ENTRY_PURCHASE_TEMPLATE = './server/controllers/stock/reports/stock_entry_purchase.receipt.handlebars';
const STOCK_ENTRY_INTEGRATION_TEMPLATE = './server/controllers/stock/reports/stock_entry_integration.receipt.handlebars';
const STOCK_ADJUSTMENT_TEMPLATE = './server/controllers/stock/reports/stock_adjustment.receipt.handlebars';

// reports
const STOCK_LOTS_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_lots.report.handlebars';
const STOCK_MOVEMENTS_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_movements.report.handlebars';
const STOCK_INVENTORIES_REPORT_TEMPLATE = './server/controllers/stock/reports/stock_inventories.report.handlebars';

// ===================================== receipts ========================================

/**
 * @method stockExitPatientReceipt
 *
 * @description
 * This method builds the stock exit to patient receipt
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
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      CONCAT_WS('.', '${identifiers.PATIENT.key}', proj.abbr, p.reference) AS patient_reference, p.hospital_no,
      l.label, l.expiration_date, d.text AS depot_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
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
        depot_name           : line.depot_name,
        patient_reference    : line.patient_reference,
        patient_display_name : line.patient_display_name,
        hospital_no          : line.hospital_no,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
        document_reference   : line.document_reference,
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

/**
 * @method stockAdjustmentReceipt
 *
 * @description
 * This method builds the stock adjustment receipt
 * file to be sent to the client.
 *
 * GET /receipts/stock/adjustment/:document_uuid
 */
function stockAdjustmentReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.REPORTS.ADJUSTMENT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ADJUSTMENT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, m.is_exit,
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN user u ON u.id = m.user_id 
    WHERE m.flux_id IN (${Stock.flux.FROM_ADJUSTMENT}, ${Stock.flux.TO_ADJUSTMENT}) AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        is_exit            : line.is_exit,
        depot_name         : line.depot_name,
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
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

/**
 * @method stockExitServiceReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_service/:document_uuid
 */
function stockExitServiceReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.REPORTS.EXIT_SERVICE' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_SERVICE_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name, s.name AS service_display_name, 
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN service s ON s.uuid = m.entity_uuid 
    JOIN user u ON u.id = m.user_id 
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_SERVICE} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name           : line.depot_name,
        service_display_name : line.service_display_name,
        user_display_name    : line.user_display_name,
        description          : line.description,
        date                 : line.date,
        document_uuid        : line.document_uuid,
        document_reference   : line.document_reference,
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

/**
 * @method stockExitLossReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_loss/:document_uuid
 */
function stockExitLossReceipt(req, res, next) {
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.REPORTS.EXIT_LOSS' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_LOSS_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name, 
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN user u ON u.id = m.user_id 
    WHERE m.is_exit = 1 AND m.flux_id = ${Stock.flux.TO_LOSS} AND m.document_uuid = ?
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name         : line.depot_name,
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
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


/**
 * @method stockExitDepotReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/exit_depot/:document_uuid
 */
function stockExitDepotReceipt(req, res, next) {
  let report;
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.RECEIPTS.EXIT_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise)
    .then(data => report.render(data))
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

/**
 * @method stockEntryDepotReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_depot/:document_uuid
 */
function stockEntryDepotReceipt(req, res, next) {
  let report;
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.RECEIPTS.ENTRY_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise)
    .then(data => report.render(data))
    .then(result => res.set(result.headers).send(result.report))
    .catch(next)
    .done();
}

/**
 * @method stockEntryPurchaseReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_purchase/:document_uuid
 */
function stockEntryPurchaseReceipt(req, res, next) {
  let report, data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.RECEIPTS.ENTRY_PURCHASE' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_PURCHASE_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name,
      CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference, p.note, p.cost, p.date AS purchase_date, p.payment_method,
      s.display_name AS supplier_display_name, proj.name AS project_display_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN user u ON u.id = m.user_id 
    JOIN purchase p ON p.uuid = l.origin_uuid
    JOIN supplier s ON s.uuid = p.supplier_uuid
    JOIN project proj ON proj.id = p.project_id
    WHERE m.is_exit = 0 AND m.flux_id = ${Stock.flux.FROM_PURCHASE} AND m.document_uuid = ? 
    ORDER BY i.text, l.label
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name            : line.depot_name,
        user_display_name     : line.user_display_name,
        description           : line.description,
        date                  : line.date,
        document_uuid         : line.document_uuid,
        document_reference    : line.document_reference,
        purchase_reference    : line.purchase_reference,
        p_note                : line.note,
        p_cost                : line.cost,
        p_date                : line.purchase_date,
        p_method              : line.payment_method,
        supplier_display_name : line.supplier_display_name,
        project_display_name  : line.project_display_name,
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

/**
 * @method stockEntryIntegrationReceipt
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /receipts/stock/entry_integration/:document_uuid
 */
function stockEntryIntegrationReceipt(req, res, next) {
  let report, data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename: 'STOCK.RECEIPTS.ENTRY_INTEGRATION' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_INTEGRATION_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name,
      CONCAT_WS('.', '${identifiers.INTEGRATION.key}', proj.abbr, integ.reference) AS integration_reference, integ.description, integ.date AS integration_date,
      proj.name AS project_display_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN user u ON u.id = m.user_id 
    JOIN integration integ ON integ.uuid = l.origin_uuid
    JOIN project proj ON proj.id = integ.project_id
    WHERE m.is_exit = 0 AND m.flux_id = ${Stock.flux.FROM_INTEGRATION} AND m.document_uuid = ? 
    ORDER BY i.text, l.label
  `;

  return db.exec(sql, [db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found');
      }
      const line = rows[0];

      data.enterprise = req.session.enterprise;

      data.details = {
        depot_name            : line.depot_name,
        user_display_name     : line.user_display_name,
        description           : line.description,
        date                  : line.date,
        document_uuid         : line.document_uuid,
        document_reference    : line.document_reference,
        integration_reference : line.integration_reference,
        integration_date      : line.integration_date,
        project_display_name  : line.project_display_name,
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

/**
 * getDepotMovement
 * @param {string} documentUuid
 * @param {object} enterprise
 * @description return depot movement informations
 * @return {object} data
 */
function getDepotMovement(documentUuid, enterprise) {
  const data = {};
  const sql = `
    SELECT i.code, i.text, BUID(m.document_uuid) AS document_uuid, 
      m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total , m.date, m.description, 
      u.display_name AS user_display_name,
      CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
      l.label, l.expiration_date, d.text AS depot_name  
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid 
    JOIN inventory i ON i.uuid = l.inventory_uuid 
    JOIN depot d ON d.uuid = m.depot_uuid 
    JOIN user u ON u.id = m.user_id 
    WHERE m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?
  `;

  return db.exec(sql, [1, Stock.flux.TO_OTHER_DEPOT, db.bid(documentUuid)])
    .then((rows) => {
      // exit movement
      if (!rows.length) {
        throw new NotFound('document not found for exit');
      }
      const line = rows[0];

      data.enterprise = enterprise;
      data.exit = {};

      data.exit.details = {
        depot_name         : line.depot_name,
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
      };

      data.rows = rows;
      return db.exec(sql, [0, Stock.flux.FROM_OTHER_DEPOT, db.bid(documentUuid)]);
    })
    .then((rows) => {
      // entry movement
      if (!rows.length) {
        throw new NotFound('document not found for entry');
      }
      const line = rows[0];

      data.enterprise = enterprise;
      data.entry = {};

      data.entry.details = {
        depot_name         : line.depot_name,
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
      };
      return data;
    });
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
exports.stockExitDepotReceipt = stockExitDepotReceipt;
exports.stockEntryDepotReceipt = stockEntryDepotReceipt;
exports.stockExitServiceReceipt = stockExitServiceReceipt;
exports.stockExitLossReceipt = stockExitLossReceipt;
exports.stockEntryPurchaseReceipt = stockEntryPurchaseReceipt;
exports.stockEntryIntegrationReceipt = stockEntryIntegrationReceipt;
exports.stockAdjustmentReceipt = stockAdjustmentReceipt;

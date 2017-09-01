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

const PeriodService = require('../../../lib/period');
const Stock = require('../core');

const BASE_PATH = './server/controllers/stock/reports';

// receipts
const STOCK_EXIT_PATIENT_TEMPLATE = `${BASE_PATH}/stock_exit_patient.receipt.handlebars`;
const STOCK_EXIT_SERVICE_TEMPLATE = `${BASE_PATH}/stock_exit_service.receipt.handlebars`;
const STOCK_EXIT_DEPOT_TEMPLATE = `${BASE_PATH}/stock_exit_depot.receipt.handlebars`;
const STOCK_EXIT_LOSS_TEMPLATE = `${BASE_PATH}/stock_exit_loss.receipt.handlebars`;

const STOCK_ENTRY_DEPOT_TEMPLATE = `${BASE_PATH}/stock_entry_depot.receipt.handlebars`;
const STOCK_ENTRY_PURCHASE_TEMPLATE = `${BASE_PATH}/stock_entry_purchase.receipt.handlebars`;
const STOCK_ENTRY_INTEGRATION_TEMPLATE = `${BASE_PATH}/stock_entry_integration.receipt.handlebars`;
const STOCK_ADJUSTMENT_TEMPLATE = `${BASE_PATH}/stock_adjustment.receipt.handlebars`;

// reports
const STOCK_LOTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_lots.report.handlebars`;
const STOCK_MOVEMENTS_REPORT_TEMPLATE = `${BASE_PATH}/stock_movements.report.handlebars`;
const STOCK_INVENTORIES_REPORT_TEMPLATE = `${BASE_PATH}/stock_inventories.report.handlebars`;
const STOCK_INVENTORY_REPORT_TEMPLATE = `${BASE_PATH}/stock_inventory.report.handlebars`;

// ===================================== receipts ========================================

/*
* This function help to format filter display name
* Whitch must appear in the report
*/
function formatFilters(qs) {
  const columns = [
    { field : 'depot_uuid', displayName : 'STOCK.DEPOT' },
    { field : 'inventory_uuid', displayName : 'STOCK.INVENTORY' },
    { field : 'status', displayName : 'FORM.LABELS.STATUS' },
    { field : 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', isPeriod : true },
    { field : 'period', displayName : 'TABLE.COLUMNS.PERIOD', isPeriod : true },
    { field : 'limit', displayName : 'FORM.LABELS.LIMIT' },

    { field : 'entry_date_from', displayName : 'STOCK.ENTRY_DATE', comparitor : '>', isDate : true },
    { field : 'entry_date_to', displayName : 'STOCK.ENTRY_DATE', comparitor : '<', isDate : true },
  ];

  return columns.filter(column => {
    const value = qs[column.field];

    if (!_.isUndefined(value)) {
      if (column.isPeriod) {
        const service = new PeriodService(new Date());
        column.value = service.periods[value].translateKey;
      } else {
        column.value = value;
      }
      return true;
    }
    return false;
  });
}

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
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_PATIENT' });

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
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.ADJUSTMENT' });

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
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_SERVICE' });

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
  const optionReport = _.extend(req.query, { filename : 'STOCK.REPORTS.EXIT_LOSS' });

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
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.EXIT_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_EXIT_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise, true)
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
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.ENTRY_DEPOT' });

  // set up the report with report manager
  try {
    report = new ReportManager(STOCK_ENTRY_DEPOT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return getDepotMovement(documentUuid, req.session.enterprise, false)
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
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.ENTRY_PURCHASE' });

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
      CONCAT_WS('.', '${identifiers.PURCHASE_ORDER.key}', proj.abbr, p.reference) AS purchase_reference,
      p.note, p.cost, p.date AS purchase_date, p.payment_method,
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
  let report;
  const data = {};
  const documentUuid = req.params.document_uuid;
  const optionReport = _.extend(req.query, { filename : 'STOCK.RECEIPTS.ENTRY_INTEGRATION' });

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
      CONCAT_WS('.', '${identifiers.INTEGRATION.key}', proj.abbr, integ.reference) AS integration_reference,
      integ.description, integ.date AS integration_date,
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
 * @param {boolean} isExit 
 * @description return depot movement informations
 * @return {object} data
 */
function getDepotMovement(documentUuid, enterprise, isExit) {
  const data = {};
  const is_exit = isExit ? 1 : 0;
  const sql = `
        SELECT 
          i.code, i.text, BUID(m.document_uuid) AS document_uuid,
          m.quantity, m.unit_cost, (m.quantity * m.unit_cost) AS total, m.date, m.description,
          u.display_name AS user_display_name,
          CONCAT_WS('.', '${identifiers.DOCUMENT.key}', m.reference) AS document_reference,
          l.label, l.expiration_date, d.text AS depot_name, dd.text as otherDepotName
        FROM 
          stock_movement m
        JOIN 
          lot l ON l.uuid = m.lot_uuid
        JOIN 
          inventory i ON i.uuid = l.inventory_uuid
        JOIN 
          depot d ON d.uuid = m.depot_uuid
        JOIN 
          user u ON u.id = m.user_id
        LEFT JOIN 
          depot dd ON dd.uuid = entity_uuid
        WHERE 
          m.is_exit = ? AND m.flux_id = ? AND m.document_uuid = ?`;

  return db.exec(sql, [is_exit, isExit ? Stock.flux.TO_OTHER_DEPOT : Stock.flux.FROM_OTHER_DEPOT, db.bid(documentUuid)])
    .then((rows) => {
      if (!rows.length) {
        throw new NotFound('document not found for exit');
      }      
      const line = rows[0];

      data.enterprise = enterprise;
      const key = isExit ? 'exit' : 'entry';
      data[key] = {};

      data[key].details = {
        depot_name         : line.depot_name,
        otherDepotName     : line.otherDepotName || '',
        user_display_name  : line.user_display_name,
        description        : line.description,
        date               : line.date,
        document_uuid      : line.document_uuid,
        document_reference : line.document_reference,
      };

      data.rows = rows;
      return data ;
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

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_LOTS',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

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

  if (options.defaultPeriod) {
    options.defaultPeriodEntry = options.defaultPeriod;
    delete options.defaultPeriod;
  }


  return Stock.getLotsDepot(null, options)
    .then((rows) => {
      data.rows = rows;
      data.hasFilter = hasFilter;
      data.csv = rows;
      data.display = display;
      data.filters = formatFilters(options);

      // group by depot
      let depots = _.groupBy(rows, d => d.depot_text);

      // make sure that they keys are sorted in alphabetical order
      depots = _.mapValues(depots, lines => {
        _.sortBy(lines, 'depot_text');
        return lines;
      });

      data.depots = depots;
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
  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_MOVEMENTS',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

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
      data.filters = formatFilters(display);

      // group by depot
      let depots = _.groupBy(rows, d => d.depot_text);

      // make sure that they keys are sorted in alphabetical order
      depots = _.mapValues(depots, lines => {
        _.sortBy(lines, 'depot_text');
        return lines;
      });

      data.depots = depots;
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
 * This method builds the stock report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventories
 */
function stockInventoriesReport(req, res, next) {
  let options = {};
  let display = {};
  let hasFilter = false;
  let report;
  let filters;

  const data = {};
  const bundle = {};

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_INVENTORY',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  // set up the report with report manager
  try {
    if (req.query.identifiers && req.query.display) {
      options = JSON.parse(req.query.identifiers);
      display = JSON.parse(req.query.display);
      hasFilter = Object.keys(display).length > 0;
      filters = formatFilters(display);
    } else if (req.query.params) {
      options = JSON.parse(req.query.params);
      bundle.delay = options.inventory_delay;
      bundle.purchaseInterval = options.purchase_interval;
    }

    report = new ReportManager(STOCK_INVENTORIES_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return Stock.getInventoryQuantityAndConsumption(options)
    .then((rows) => {
      data.rows = rows;
      data.hasFilter = hasFilter;
      data.filters = filters;
      data.csv = rows;
      data.display = display;

      data.dateTo = options.dateTo;
      data.delay = bundle.delay || 1;
      data.purchaseInterval = bundle.purchaseInterval || 1;

      // group by depot
      let depots = _.groupBy(rows, d => d.depot_text);

      // make sure that they keys are sorted in alphabetical order
      depots = _.mapValues(depots, lines => {
        _.sortBy(lines, 'depot_text');
        return lines;
      });

      data.depots = depots;
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * @method stockInventoryReport
 *
 * @description
 * This method builds the stock inventory report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/inventory
 */
function stockInventoryReport(req, res, next) {
  const data = {};
  let options;
  let report;

  const optionReport = _.extend(req.query, {
    filename : 'TREE.STOCK_INVENTORY_REPORT',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  // set up the report with report manager
  try {
    options = req.query.params ? JSON.parse(req.query.params) : {};
    report = new ReportManager(STOCK_INVENTORY_REPORT_TEMPLATE, req.session, optionReport);
  } catch (e) {
    return next(e);
  }

  return db.one('SELECT code, text FROM inventory WHERE uuid = ?;', [db.bid(options.inventory_uuid)])
    .then((inventory) => {
      data.inventory = inventory;

      return db.one('SELECT text FROM depot WHERE uuid = ?;', [db.bid(options.depot_uuid)]);
    })
    .then((depot) => {
      data.depot = depot;

      return Stock.getInventoryMovements(options);
    })
    .then((rows) => {
      data.rows = rows.movements;
      data.totals = rows.totals;
      data.result = rows.result;
      data.csv = rows.movements;
      data.dateTo = options.dateTo;

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
exports.stockInventoryReport = stockInventoryReport;
exports.stockExitPatientReceipt = stockExitPatientReceipt;
exports.stockExitDepotReceipt = stockExitDepotReceipt;
exports.stockEntryDepotReceipt = stockEntryDepotReceipt;
exports.stockExitServiceReceipt = stockExitServiceReceipt;
exports.stockExitLossReceipt = stockExitLossReceipt;
exports.stockEntryPurchaseReceipt = stockEntryPurchaseReceipt;
exports.stockEntryIntegrationReceipt = stockEntryIntegrationReceipt;
exports.stockAdjustmentReceipt = stockAdjustmentReceipt;

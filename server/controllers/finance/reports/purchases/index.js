
/**
 * @overview
 * Invoice Reports
 *
 * @description
 * This module contains the functionality to generate invoice reports and
 * receipts.
 *
 */

const _ = require('lodash');
const util = require('../../../../lib/util');

const Moment = require('moment');

const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Purchases = require('../../purchases');

const pdf = require('../../../../lib/renderers/pdf');
const REPORT_TEMPLATE = './server/controllers/finance/reports/purchases/report.handlebars';

exports.report = report;

// translation key mappings for dynamic filters
// Basically, to show a pretty filter bar, this will translate URL query params
// into human-readable text to be placed in the report, showing the properties
// filtered on.
function formatFilters(qs) {
  const columns = [
    { field : 'reference', displayName : 'FORM.LABELS.REFERENCE' },
    { field : 'user_id', displayName: 'FORM.LABELS.USER' },
    { field : 'supplier_uuid', displayName: 'FORM.LABELS.SUPPLIER' },  
    { field : 'is_confirmed', displayName: 'PURCHASES.STATUS.CONFIRMED' },
    { field : 'is_received', displayName: 'PURCHASES.STATUS.RECEIVED' },
    { field : 'is_cancelled', displayName: 'PURCHASES.STATUS.CANCELLED' },
    { field : 'period', displayName : 'TABLE.COLUMNS.PERIOD'},
    { field : 'custom_period_start', displayName : 'PERIODS.START', isDate : true, comparitor : '>'},
    { field : 'custom_period_end', displayName : 'PERIODS.END', isDate : true, comparitor: '<'},
    { field : 'limit', displayName : 'FORM.LABELS.LIMIT' }
  ];

  return columns.filter(column => {
    const value = qs[column.field];

    if (!_.isUndefined(value)) {
      column.value = value;
      return true;
    }
    return false;
  });
}


/**
 * @function report
 * @desc build a report for Purchace Registry report of metadata
 * @param {array} data Purchase Registry report of metadata
 * @return {object} promise
 */
function report(req, res, next) {
  let reportInstance;

  const query = _.clone(req.query);
  const filters = formatFilters(req.query);

  _.extend(query, { filename : 'TREE.PURCHASE_REGISTRY', csvKey : 'rows', footerRight : '[page] / [toPage]', footerFontSize : '8'});

  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
  } catch (e) {
    next(e);
    return;
  }

  const data = { filters };

  Purchases.find(query)
    .then(rows => {
      rows.forEach((row) => {
        row.isPartiallyRecieved = (row.is_received && row.is_partially_received && !row.is_cancelled);
        row.isReceived = (row.is_confirmed && !row.is_partially_received && row.is_received && !row.is_cancelled);
        row.isConfirmed = (row.is_confirmed && !row.is_partially_received && !row.is_received && !row.is_cancelled);
        row.isWaitingConfirmation = (!row.is_confirmed && !row.is_cancelled);
      });

      data.rows = rows;
      return reportInstance.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}


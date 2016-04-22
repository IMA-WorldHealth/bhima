var db      = require('./../../../lib/db');
var q       = require('q');
var numeral = require('numeral');

var formatDollar = '$0,0.00',
    formatFranc = '0.0,00';

function fmtDate(date) {

  // if we pass in a string, return it right away
  if (typeof date === 'string') { return date; }

  var d     = new Date(date),
      month = '' + (d.getMonth() + 1),
      day   = '' + d.getDate(),
      year  = d.getFullYear();

  if (month.length < 2) { month = '0' + month; }
  if (day.length < 2) { day = '0' + day; }

  return [year, month, day].join('-');
}

// compiles the patient receipt
exports.compile = function (options) {
  'use strict';

  var context = {};
  var saleId = options.sale;

  context.i18n = (options.language == 'fr') ?
      require('../lang/fr.json').INVOICE :
      require('../lang/en.json').INVOICE;

  var currencyFmt = (options.currency === 'dollars') ?
      formatDollar : formatFranc;

  // Ensure mandatory options are set
  if (!saleId) {
    return q.reject('Document requires valid sale reference');
  }

  var sql =
    `SELECT * FROM sale_item LEFT JOIN sale ON sale_item.sale_uuid = sale.uuid
    LEFT JOIN inventory ON sale_item.inventory_uuid = inventory.uuid
    LEFT JOIN project ON sale.project_id = project.id WHERE sale.uuid = ?
    ORDER BY inventory.code;`;

  return db.exec(sql, [saleId])
  .then(function (rows) {
    var projectId;
    var invalidSaleRequest = rows.length === 0;

    if (invalidSaleRequest) {
      throw 'Invalid sale reference provided';
    }

    context.invoice = { items : rows };
    context.invoice.totalCost = numeral(sumCosts(rows)).format(currencyFmt);

    // TODO -- this should accept either FC or USD formatted currencies
    formatCurrency(context.invoice.items, currencyFmt);
    projectId = context.invoice.items[0].project_id;

    sql =
      `SELECT project.id, enterprise.id AS enterprise_id, enterprise.name, project.abbr,
        enterprise.abbr AS enterpriseAbbr, enterprise.phone, enterprise.email, enterprise.location_id,
        enterprise.po_box
      FROM project JOIN enterprise ON project.enterprise_id = enterprise.id
      WHERE project.id = ?`;

    // Query for enterprise information
    return db.exec(sql, [projectId]);
  })
  .then(function (result) {
    var initialLineItem = context.invoice.items[0];
    context.enterprise = result[0];

    context.invoice.reference = initialLineItem.reference;
    context.invoice.id = initialLineItem.abbr.concat(initialLineItem.reference);
    context.invoice.date = fmtDate(initialLineItem.invoice_date);

    sql =
      `SELECT patient.hospital_no, patient.sex, CONCAT(patient.first_name, " ", patient.middle_name, " ", patient.last_name) AS patientName,
        patient.profession, CONCAT(project.abbr, patient.reference) AS code, debtor_group.name AS groupName, patient.registration_date,
        patient.dob
      FROM debtor JOIN patient JOIN debtor_group JOIN project ON
        debtor.uuid = patient.debtor_uuid AND
        debtor_group.uuid = debtor.group_uuid AND
        project.id = patient.project_id
      WHERE debtor.uuid = ?`;

    // Query for recipient information
    return db.exec(sql, [initialLineItem.debtor_uuid]);
  })
  .then(function (result) {
    context.recipient = result[0];
    context.recipient.registration_date = fmtDate(context.recipient.registration_date);
    return context;
  });
};

function sumCosts(lineItems) {
  return lineItems.reduce(function (a, b) { return a + b.credit - b.debit; }, 0);
}

// TODO -- this should format either FC or USD
function formatCurrency(lineItems, fmt) {
  lineItems.forEach(function (lineItem) {
    lineItem.formattedPrice = numeral(lineItem.transaction_price).format(fmt);
    lineItem.formattedTotal = numeral(lineItem.credit - lineItem.debit).format(fmt);
  });
}


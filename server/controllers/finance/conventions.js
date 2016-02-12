/**
* The /cash/conventions HTTP API endpoint
*
* @module finance/conventions
*
* @desc This module is responsible for handling all crud operations relatives
* to convention payment and define all convention api functions
*
* @required node-uuid
* @required lib/db
* @required lib/util
* @required debtorGroups
* @required journal/primarycash
*
* @todo implements functions for the GET method
* @todo implements functions for the PUT method
*/

'use strict';

var uuid               = require('node-uuid'),
    db                 = require('../../lib/db'),
    util               = require('../../lib/util'),
    debtorGroups       = require('./debtorGroups'),
    journalConvention  = require('./journal/primarycash').convention;

var getGroupInvoices   = debtorGroups.fetchInvoices;

/** create a new convention payment record in the database */
exports.create = create;

/**
* POST /cash/conventions
*
* @desc This function is responsible for creating a new convention payment record in the database
* and writing to the posting journal
*
* @param {object} PrimaryCashRecord A Primary cash record
*
* @example
* // An example of the object sended in the post request
* // All object's properties below are required
* {
*   uuid            : {uuid},
*   project_id      : {number},
*   type            : {char},
*   date            : {date},
*   currency_id     : {number},
*   account_id      : {number},
*   cost            : {number},
*   user_id         : {number},
*   description     : {string},
*   cash_box_id     : {number},
*   origin_id       : {number}
* }
*/
function create(req, res, next) {
  var qData            = req.body,
      exchangeRate     = {},
      primaryCashItems = [],
      overviews        = [];

  var query =
      'SELECT `debitor_group`.`uuid` FROM `debitor_group` ' +
      'WHERE `debitor_group`.`account_id` = ?';

  db.exec(query, [qData.account_id])
  .then(getConventionUuid)
  .spread(getGroupInvoices)
  .then(getUnpayedInvoices)
  .then(getExchangeRate)
  .then(handleExchangeRate)
  .then(writePay)
  .then(writeToJournal)
  .catch(next)
  .done();

  function getConventionUuid(rows) {
    /** return data as parameters to getGroupInvoices */
    return [rows[0].uuid, null, req.codes];
  }

  function getUnpayedInvoices(rows) {
    var situations = rows.filter(function (situation){
      return situation.balance > 0;
    });
    overviews = situations;
  }

  function getExchangeRate() {
    if (!qData.date) { throw new req.codes.ERR_DATE_NOT_DEFINED(); }
    query =
        'SELECT e.id, e.enterprise_id, e.currency_id, e.rate, e.date FROM exchange_rate e ' +
        'WHERE DATE(e.date) = DATE(?) ';
    return db.exec(query, [qData.date]);
  }

  function handleExchangeRate(rates) {
    if (!rates.length) { throw new req.codes.ERR_EXCHANGE_RATE_NOT_FOUND(); }
    exchangeRate = rates[0];
  }

  function writePay() {
    /** Initialise the transaction handler */
    var transaction = db.transaction();

    /** Query to the primary cash */
    query = 'INSERT INTO primary_cash ' +
        '(uuid, project_id, type, date, currency_id, account_id, cost, description, cash_box_id, origin_id, user_id) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var paramPrimaryCash = [
        qData.uuid, qData.project_id, qData.type, new Date(qData.date), qData.currency_id,
        qData.account_id, qData.cost, qData.description, qData.cash_box_id, qData.origin_id, qData.user_id
    ];
    transaction.addQuery(query, paramPrimaryCash);

    /** Query to the primary cash item */
    primaryCashItems = getPrimaryCashItems(qData.cost, qData.uuid);
    query = 'INSERT INTO `primary_cash_item` ' +
        '(uuid, primary_cash_uuid, debit, credit, inv_po_id, document_uuid) VALUES ?';
    transaction.addQuery(query, [primaryCashItems]);

    /** Execute queries through the transaction */
    return transaction.execute();
  }

  function writeToJournal() {
    journalConvention(qData.uuid, qData.user_id, function (err, result) {
      if (err) { return next(err); }
      res.status(201).json({ id : qData.uuid });
    });
  }

  /** Get Primary Cash Items */
  function getPrimaryCashItems(maxAmount, primaryCashUuid) {
    var items = [];
    var costReceived = maxAmount;

    /** Enterprise currency is dollars */
    var isEnterpriseCurrency = qData.currency_id === req.session.enterprise.currency_id;

    /** Sort receipts by date ASC */
    overviews.sort(function (a, b) {
      return a.trans_date > b.trans_date;
    });

    /** Collecting primary cash items */
    var row, balance, allocatedCost;
    for (var i = 0; i < overviews.length; i++) {
      row           = overviews[i];
      balance       = isEnterpriseCurrency ? row.balance : row.balance * exchangeRate.rate;
      allocatedCost = (costReceived > balance) ? balance : costReceived;

      items.push([uuid.v4(), primaryCashUuid, allocatedCost, 0, row.inv_po_id, row.inv_po_id]);
      costReceived -= allocatedCost;

      if (costReceived === 0) { break; }
    }

    return items;
  }

}

/**
* The /cash/generic/incomes HTTP API endpoint
*
* @module finance/genericIncomes
*
* @desc This module is responsible for handling all crud operations relatives
* to generic incomes payment and define all genericc incomes api functions
*
* @required node-uuid
* @required lib/db
* @required lib/util
* @required journal/primarycash
*
* @todo implements functions for the GET method
* @todo implements functions for the PUT method
*/

'use strict';

var journalGenericIncome = require('./journal/primarycash').genericIncome,
    uuid = require('node-uuid'),
    db   = require('../../lib/db'),
    util = require('../../lib/util');

/** create a new convention payment record in the database */
exports.create = create;

/**
* POST /cash/generic/incomes
*
* @desc This function is responsible for creating a new generic incomes payment
* record in the database and writing into the posting journal
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
  var qData = req.body;

  getExchangeRate()
  .then(writePay)
  .then(writeToJournal)
  .catch(next)
  .done();

  function getExchangeRate() {
    if (!qData.date) { throw new req.codes.ERR_DATE_NOT_DEFINED(); }
    var query =
        'SELECT e.id, e.enterprise_id, e.currency_id, e.rate, e.date FROM exchange_rate e ' +
        'WHERE DATE(e.date) = DATE(?) ';
    return db.exec(query, [qData.date]);
  }

  function writePay(rows) {
    if (!rows.length) { throw new req.codes.ERR_EXCHANGE_RATE_NOT_FOUND(); }

    /** Initialise the transaction handler */
    var transaction = db.transaction();

    /** Query to the primary cash */
    var queryPC = 'INSERT INTO primary_cash ' +
        '(uuid, project_id, type, date, currency_id, account_id, cost, description, cash_box_id, origin_id, user_id) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var paramPC = [
        qData.uuid, qData.project_id, qData.type, new Date(qData.date), qData.currency_id,
        qData.account_id, qData.cost, qData.description, qData.cash_box_id, qData.origin_id, qData.user_id
    ];
    transaction.addQuery(queryPC, paramPC);

    /** Query to the primary cash item */
    var queryPCI = 'INSERT INTO `primary_cash_item` ' +
        '(uuid, primary_cash_uuid, debit, credit, document_uuid) VALUES (?, ?, ?, ?, ?)';
    var paramPCI = [ uuid.v4(), qData.uuid, qData.cost, 0, uuid.v4() ];
    transaction.addQuery(queryPCI, paramPCI);

    /** Execute queries through the transaction */
    return transaction.execute();
  }

  function writeToJournal() {
    journalGenericIncome(qData.uuid, qData.user_id, function (err, result) {
      if (err) { return next(err); }
      res.status(201).json({ id : qData.uuid });
    });
  }
}

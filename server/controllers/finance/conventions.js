/**
* The /cash/conventions HTTP API endpoint
*
* @module finance/conventions
*
* @desc This module is responsible for handling all crud operations relatives
* to convention payment and define all convention api functions
*
* @required q
* @required lib/db
* @required lib/guid
* @required lib/util
* @required ledger
* @required journal/primarycash
*
* @todo implements functions for the GET method
* @todo implements functions for the PUT method
*/

'use strict';

var q                  = require('q'),
    db                 = require('../../lib/db'),
    uuid               = require('../../lib/guid'),
    util               = require('../../lib/util'),
    ledger             = require('./ledger'),
    journalConvention  = require('./journal/primarycash').convention;

var getDebitorReceipt  = ledger.debitor_group;

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
      'WHERE `debitor_group`.`account_id`=?';

  db.exec(query, [qData.account_id])
  .then(getConventionUuid)
  .then(getDebitorReceipt)
  .then(getUnpayedReceipts)
  .then(getExchangeRate)
  .then(writePay)
  .then(writeItems)
  .then(writeToJournal)
  .catch(next);

  function getConventionUuid(rows) {
    return rows.pop().uuid;
  }

  function getUnpayedReceipts(rows) {
    var situations = rows.filter(function (situation){
      return situation.balance > 0;
    });
    overviews = situations;
  }

  function getExchangeRate() {
    var date = util.toMysqlDate(new Date(qData.date)) || util.toMysqlDate(new Date());
    var query =
        'SELECT e.id, e.enterprise_currency_id, e.foreign_currency_id, e.rate, e.date FROM exchange_rate e ' +
        'WHERE e.date = ? ';
    return db.exec(query, [date])
    .then(function (rates) {
      if (!rates.length) { return next(new req.codes.ERR_EXCHANGE_RATE_NOT_FOUND()); }
      exchangeRate = rates.pop();
    })
    .catch(next);
  }

  function writePay() {
    var sqlPrimaryCash = 'INSERT INTO primary_cash ' +
        '(uuid, project_id, type, date, currency_id, account_id, cost, description, cash_box_id, origin_id, user_id) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var paramPrimaryCash = [
        qData.uuid, qData.project_id, qData.type, new Date(qData.date), qData.currency_id,
        qData.account_id, qData.cost, qData.description, qData.cash_box_id, qData.origin_id, qData.user_id
    ];
    return db.exec(sqlPrimaryCash, paramPrimaryCash);
  }

  function writeItems() {
    primaryCashItems = getPrimaryCashItems(qData.cost, qData.uuid);
    return q.all(primaryCashItems.map(function (item) {
      return db.exec('INSERT INTO `primary_cash_item` SET ? ', [item]);
    }));
  }

  function writeToJournal(row) {
    journalConvention(qData.uuid, qData.user_id, function (err, result) {
      if (err) { return next(err); }
      res.status(201).json({ id : qData.uuid });
    });
  }

  /** Get Primary Cash Items */
  function getPrimaryCashItems(max_amount, primary_cash_uuid) {
    var items = [];
    var cost_received = max_amount;

    /**
    * We supposed that the enterprise currency is dollars $ (id=2),
    * if the selected currency is not dollars, it must be necessarely Congolese Franc (id=1)
    */
    if (qData.currency_id === req.session.enterprise.currency_id) {
      for (var i = 0; i < overviews.length; i += 1){
        cost_received -= overviews[i].balance;
        if(cost_received >= 0) {
          items.push({
            uuid : uuid(),
            primary_cash_uuid : primary_cash_uuid,
            debit : overviews[i].balance,
            credit : 0,
            inv_po_id : overviews[i].inv_po_id,
            document_uuid : overviews[i].inv_po_id
          });
        }else{
          cost_received += overviews[i].balance;
          items.push({
            uuid : uuid(),
            primary_cash_uuid : primary_cash_uuid,
            debit : cost_received,
            credit : 0,
            inv_po_id : overviews[i].inv_po_id,
            document_uuid : overviews[i].inv_po_id
          });
          break;
        }
      }
    } else {
      /**
      * The selected currency is Fc, We need to make a conversion
      * We convert from dollars $ to Congolese Franc Fc
      */
      for (var j = 0; j < overviews.length; j += 1){
        var value = (overviews[j].balance * exchangeRate.rate);
        cost_received -= value;
        if (cost_received >= 0) {
          items.push({
            uuid : uuid(),
            primary_cash_uuid : primary_cash_uuid,
            debit : value,
            credit : 0,
            inv_po_id : overviews[j].inv_po_id,
            document_uuid : overviews[j].inv_po_id
          });
        } else {
          cost_received += value;
          items.push({
            uuid : uuid(),
            primary_cash_uuid : primary_cash_uuid,
            debit : cost_received,
            credit : 0,
            inv_po_id : overviews[j].inv_po_id,
            document_uuid : overviews[j].inv_po_id
          });
          break;
        }
      }
    }
    return items;
  }

}

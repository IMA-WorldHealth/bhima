/**
* The Debtor Groups Controllers
*
* @module finance/debtorGroups
*
* @desc This module is responsible for handling all crud operations relatives
* to debtor groups, and relatives functions
*
* @required q
* @required lib/db
* @required lib/guid
*
*/

'use strict';

var q  = require('q'),
    db = require('../../lib/db'),
    guid = require('node-uuid');

/** Create a new debtor group */
exports.create = create;

/** Get debtor group details */
exports.detail = getDetail;

/** Get the list of debtor group */
exports.list = getList;

/** [HTTP API ENDPOINT] Get debtor groups invoices list */
exports.getInvoices = getInvoices;

/** [SERVER SIDE FUNCTION] Get debtor groups invoices list */
exports.fetchInvoices = fetchInvoices;


/**
* POST /debtor_groups/
*
* @exemple
* // An example of parameter of the post request
* {
*   enterprise_id : {number},
*   uuid : {uuid},
*   name : {string},
*   account_id : {number},
*   location_id : {uuid},
*   phone : {string},
*   email : {string},
*   note : {string},
*   locked : {number},
*   max_credit : {number},
*   is_convention : {number},
*   price_list_uuid : {uuid} or NULL,
*   apply_discounts : {number},
*   apply_billing_services : {number},
*   apply_subsidies : {number}
* };
*
* @function create
*
* @desc This function is responsible for creating a new debtor group
*/
function create(req, res, next) {

  var missingValues = !req.body.uuid || !req.body.account_id || !req.body.name || !req.body.enterprise_id;
  if (missingValues) { return next(new req.codes.ERR_MISSING_REQUIRED_PARAMETERS()); }

  var data = req.body;
  var query = 'INSERT INTO debitor_group SET ? ;';

  /** prevent required values */
  data.locked          = data.locked || 0;
  data.apply_subsidies = data.apply_subsidies || 0;
  data.apply_discounts = data.apply_discounts || 0;
  data.apply_billing_services = data.apply_billing_services || 0;

  db.exec(query, data)
  .then(function () {
    res.status(201).json({ id: data.uuid });
  })
  .catch(next)
  .done();
}

/**
* GET /debtor_groups/:uuid
*
* @function getDetail
*
* @desc This function is responsible for retrieving details of a debtor group
*/
function getDetail(req, res, next) {
  var uuid = req.params.uuid;

  var debtorDetailsQuery =
    'SELECT uuid, name, account_id, location_id, phone, email, note, locked ' +
      'max_credit, is_convention, price_list_uuid ' +
    'FROM debitor_group ' +
    'WHERE uuid = ?';

  db.exec(debtorDetailsQuery, [uuid])
  .then(function (rows) {
    if (!rows.length) { return next(new req.codes.ERR_NOT_FOUND()); }
    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();

}

/**
* GET /debtor_groups/ => all debtor groups
* GET /debtor_groups/?locked={1|0} => only locked or not locked debtor groups
*
* @function getList
*
* @desc This function is responsible for retrieving details of a debtor group
*/
function getList(req, res, next) {
  var query;

  query = 'SELECT uuid, name, locked, account_id FROM debitor_group ';
  query += (req.query.locked === '1') ? 'WHERE locked = 1' :
           (req.query.locked === '0') ? 'WHERE locked = 0' : '';

  db.exec(query)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /debtor_groups/{:uuid}/invoices
* GET /debtor_groups/{:uuid}/invoices?balanced=1
*
* @function getInvoices
*
* @desc This function is responsible for getting all invoices of a specified debtor group
*/
function getInvoices(req, res, next) {
  fetchInvoices(req.params.uuid, req.query.balanced, req.codes)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* Get Debtor group invoices
*
* @function fetchInvoices
*
* @param {number} uuid The debtor group uuid
* @param {number} balanced The optional value (1|0) for getting balanced invoices or not
* @param {array} codes The required array of error codes
*
* @return {array} An promise of an array
*/
function fetchInvoices (id, balanced, codes) {

  if (!id) { return q.reject(new codes.ERR_MISSING_REQUIRED_PARAMETERS()); }

  var query =
    'SELECT `debitor_group`.`account_id` FROM `debitor_group` ' +
    'WHERE `debitor_group`.`uuid`= ?';

  return db.exec(query, [id])
  .then(function (rows) {
    if (!rows.length) { return q.reject(new codes.ERR_NOT_FOUND()); }

    var accountId = rows[0].account_id;
    var query =
      'SELECT c.inv_po_id, c.trans_id, c.trans_date, c.account_id FROM (' +
        ' SELECT p.inv_po_id, p.trans_id, p.trans_date, p.account_id ' +
        ' FROM posting_journal AS p ' +
        ' WHERE p.account_id = ? ' +
        ' UNION ' +
        ' SELECT g.inv_po_id, g.trans_date, g.trans_id, g.account_id ' +
        ' FROM general_ledger AS g ' +
        ' WHERE g.account_id = ? ' +
      ') AS c ;';

    return db.exec(query, [accountId, accountId]);
  })
  .then(function (rows) {
    if (!rows.length) { return q.resolve([]); }

    var accountId = rows[0].account_id;
    var invoices = rows.map(function (line) {
      return line.inv_po_id;
    });

    var query =
      'SELECT s.reference, s.project_id, s.is_distributable, t.inv_po_id, t.trans_date, SUM(t.debit_equiv) AS debit,  ' +
        'SUM(t.credit_equiv) AS credit, SUM(t.debit_equiv - t.credit_equiv) as balance, ' +
        't.account_id, t.deb_cred_uuid, t.currency_id, t.doc_num, t.description, t.account_id, ' +
        't.comment ' +
      'FROM (' +
        '(' +
          'SELECT pj.inv_po_id, pj.trans_date, pj.debit, ' +
            'pj.credit, pj.debit_equiv, pj.credit_equiv, ' +
            'pj.account_id, pj.deb_cred_uuid, pj.currency_id, ' +
            'pj.doc_num, pj.trans_id, pj.description, pj.comment ' +
          'FROM posting_journal AS pj ' +
          'WHERE pj.inv_po_id IN ("' + invoices.join('","') + '") ' +
          'AND pj.account_id = ? ' +
        ') UNION (' +
          'SELECT gl.inv_po_id, gl.trans_date, gl.debit, ' +
            'gl.credit, gl.debit_equiv, gl.credit_equiv, ' +
            'gl.account_id, gl.deb_cred_uuid, gl.currency_id, ' +
            'gl.doc_num, gl.trans_id, gl.description, gl.comment ' +
          'FROM general_ledger AS gl ' +
          'WHERE gl.inv_po_id IN ("' + invoices.join('","') + '") ' +
          'AND gl.account_id = ? ' +
        ')' +
      ') AS t JOIN sale AS s on t.inv_po_id = s.uuid ' +
      'GROUP BY t.inv_po_id ';

    query += (balanced === '1') ? ' HAVING balance = 0;' :
             (balanced === '0') ? ' HAVING balance > 0;' : ';';

    return db.exec(query, [accountId, accountId]);
  });

}

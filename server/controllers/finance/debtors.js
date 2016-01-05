// TODO Patients currently responsible for setting debtor (one small line) - should this be delegated here?
// TODO Create Debtor Group
var db = require('../../lib/db'),
    guid = require('../../lib/guid');

exports.groupDetails = groupDetails;
exports.listGroups = listGroups;
exports.update = update;

function groupDetails(req, res, next) {
  var debtorDetailsQuery;
  var uuid = req.params.uuid;

  debtorDetailsQuery =
    'SELECT uuid, name, account_id, location_id, phone, email, note, locked ' +
      'max_credit, is_convention, price_list_uuid ' +
    'FROM debitor_group ' +
    'WHERE uuid = ?';

  db.exec(debtorDetailsQuery, [uuid])
    .then(function (result) {
      var debtorDetail;

      if (isEmpty(result)) {
        res.status(404).json({
          code : 'ERR_NOT_FOUND',
          reason : 'No debtor groups found under the id ' + uuid
        });
        return;
      } else {

        debtorDetail = result[0];
        res.status(200).json(debtorDetail);
      }
    })
    .catch(next)
    .done();
}

// TODO ? parameter to request all (including locked) groups
function listGroups(req, res, next) {
  var listDebtorGroupsQuery, filterLockedCondition;
  var query;

  listDebtorGroupsQuery =
    'SELECT uuid, name, locked, account_id FROM debitor_group';

  filterLockedCondition =
    'WHERE locked = 0';

  // TODO ? parameter to request all (including locked) groups
  query = listDebtorGroupsQuery.concat(' ', filterLockedCondition);

  db.exec(query)
    .then(function (result) {
      var debtors = result;

      res.status(200).json(result);
    })
    .catch(next)
    .done();
}

function update(req, res, next) { 
  var updateDebtorQuery;
  var queryData = req.body;
  var debtorId = req.params.uuid;
  
  if (!debtorId) { 
    res.status(400).json({
      code : 'ERR_INVALID_REQUEST',
      reason : 'A valid debtor UUID must be provided to update a debtor record.'
    });
    return;
  }
  
  updateDebtorQuery = 
    'UPDATE debitor SET ? WHERE uuid = ?';
  
  db.exec(updateDebtorQuery, [queryData, debtorId])
    .then(function (result) { 
    
      return handleFetchDebtor(debtorId);
    })
    .then(function (updatedDebtor) { 
      res.status(200).json(updatedDebtor);
    })
    .catch(next)
    .done();
}

function handleFetchDebtor(uuid) { 
  var debtorQuery = 
    'SELECT uuid, group_uuid, text ' + 
    'FROM debitor ' + 
    'WHERE uuid = ?';

  return db.exec(debtorQuery, [uuid])
    .then(function (debtorResult) { 
      
      // Got correct debtor - seperate JSON object
      return debtorResult[0];
    });
}

function isEmpty(array) {
  return array.length === 0;
}

// GET /debtor/:uuid/invoices
// Show open invoices for a debtor
exports.invoices = function invoices(req, res, next) {
  'use strict';

  var sql, accountId;

  sql =
    'SELECT account_id ' +
    'FROM debitor JOIN debitor_group ON ' +
      'debitor.group_uuid = debitor_group.uuid ' +
    'WHERE debitor.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (rows) {

    if (!rows.length) {
      throw req.codes.NO_DEBTOR_GROUP_ACCOUNT;
    }

    accountId = rows[0].account_id;

    sql =
      'SELECT c.inv_po_id FROM (' +
        'SELECT p.inv_po_id, p.trans_id, p.trans_date, p.account_id ' +
        'FROM posting_journal AS p ' +
        'WHERE p.deb_cred_uuid = ? AND p.account_id = ? ' +
      'UNION ' +
        'SELECT g.inv_po_id, g.trans_date, g.trans_id, g.account_id ' +
        'FROM general_ledger AS g ' +
        'WHERE g.deb_cred_uuid = ? AND g.account_id = ?' +
      ') AS c;';

    return db.exec(sql, [req.params.uuid, accountId, req.params.uuid, accountId]);
  })
  .then(function (rows) {

    // skip this if something
    // TODO/FIXME-- is this a good idea?
    if (!rows.length) {
      return [];
    }

    var invoices = rows.map(function (row) {
      return row.inv_po_id;
    });

    // hrid is 'human-readable id'
    sql =
      'SELECT CONCAT(p.abbr, s.reference) AS hrid, t.inv_po_id, t.trans_date, ' +
        'SUM(t.debit_equiv - t.credit_equiv) AS balance, t.currency_id, t.description ' +
      'FROM (' +
        '(' +
          'SELECT pj.inv_po_id, pj.trans_date, pj.debit_equiv, pj.credit_equiv, ' +
            'pj.account_id, pj.deb_cred_uuid, pj.currency_id, pj.trans_id, ' +
            'pj.description, pj.comment ' +
          'FROM posting_journal AS pj ' +
        ') UNION (' +
          'SELECT gl.inv_po_id, gl.trans_date, gl.debit_equiv, gl.credit_equiv, ' +
            'gl.account_id, gl.deb_cred_uuid, gl.currency_id, gl.trans_id, ' +
            'gl.description, gl.comment ' +
          'FROM general_ledger AS gl ' +
        ')' +
      ') AS t ' +
      'JOIN sale AS s ON t.inv_po_id = s.uuid ' +
      'JOIN project AS p ON s.project_id = p.id ' +
      'WHERE t.inv_po_id IN (?) ' +
        'AND t.account_id = ? ' +
      'GROUP BY t.inv_po_id ' +
      'HAVING balance > 0;';

    return db.exec(sql, [ invoices, accountId ]);
  })
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// TODO Patients currently responsible for setting debtor (one small line) - should this be delegated here?
// TODO Create Debtor Group
var db = require('../../lib/db'),
    guid = require('../../lib/guid');

exports.groupDetails = groupDetails;
exports.listGroups = listGroups;
exports.update = update;
exports.fetchInvoices = fetchInvoices;

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
    
      return lookupDebtor(debtorId, req.codes);
    })
    .then(function (updatedDebtor) { 
      res.status(200).json(updatedDebtor);
    })
    .catch(next)
    .done();
}

function fetchInvoices (req, res, next){
  
  var accountId = null;
  var sql =
    'SELECT account_id FROM debitor_group WHERE uuid = (SELECT group_uuid FROM debitor WHERE uuid = ?)';

  lookupDebtor(req.params.uuid, req.codes)
    .then(function (){
      return db.exec(sql, [req.params.uuid]);
    })
    .then(function (rows){
      accountId = rows[0].account_id;
      sql =
      'SELECT c.inv_po_id FROM (' +
        'SELECT p.inv_po_id ' +
        'FROM posting_journal AS p ' +
        'WHERE p.deb_cred_uuid = ? AND p.account_id = ? ' +
      'UNION ' +
        'SELECT g.inv_po_id ' +
        'FROM general_ledger AS g ' +
        'WHERE g.deb_cred_uuid = ? AND g.account_id = ?' +
      ') AS c;';

      return db.exec(sql, [req.params.uuid, accountId, req.params.uuid, accountId]);
    })
    .then(function (rows){

     var invoices = rows.map(function (row) {
       return row.inv_po_id;
     });

     sql =
      'SELECT CONCAT(p.abbr, s.reference) AS reference, t.inv_po_id AS sale_uuid, t.trans_date AS date, ' +
        'SUM(t.debit_equiv - t.credit_equiv) AS balance, t.description, s.cost, COUNT(si.uuid) AS numItems, IF(ISNULL(cn.uuid), 0, 1) AS canceled ' +
      'FROM (' +
        '(' +
          'SELECT pj.inv_po_id, pj.trans_date, pj.debit_equiv, pj.credit_equiv, ' +
            'pj.account_id, pj.deb_cred_uuid, pj.trans_id, pj.description ' +
          'FROM posting_journal AS pj ' +
        ') UNION ALL (' +
          'SELECT gl.inv_po_id, gl.trans_date, gl.debit_equiv, gl.credit_equiv, ' +
            'gl.account_id, gl.deb_cred_uuid, gl.trans_id, gl.description ' +
          'FROM general_ledger AS gl ' +
        ')' +
      ') AS t ' +
      'JOIN sale AS s ON t.inv_po_id = s.uuid ' +
      'JOIN project AS p ON s.project_id = p.id ' +
      'JOIN sale_item AS si ON si.sale_uuid = s.uuid ' +
      'LEFT JOIN credit_note AS cn ON cn.sale_uuid = s.uuid ' + 
      'WHERE t.inv_po_id IN (?) ' +
        'AND t.account_id = ? ' +
        'GROUP BY t.inv_po_id';

      if(req.query.balanced === '1'){ sql += ' HAVING balance = 0;';}
      if(req.query.balanced === '0') { sql += ' HAVING balance > 0;';}

      return db.exec(sql, [invoices, accountId]);
    })
    .then(function (rows){
      res.status(200).json(rows);
    })
    .catch(next)
    .done();             
}

function lookupDebtor(uuid, codes) { 
  var debtorQuery = 
    'SELECT uuid, group_uuid, text ' + 
    'FROM debitor ' + 
    'WHERE uuid = ?';

  return db.exec(debtorQuery, [uuid])
    .then(function (rows) {
      if(rows.length === 0) { throw codes.ERR_NOT_FOUND;}
      return rows[0];
    });
}

function isEmpty(array) {
  return array.length === 0;
}


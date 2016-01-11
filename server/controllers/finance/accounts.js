//TODO Refactor/define accounts API

var db = require('../../lib/db');
var sanitize = require('../../lib/sanitize');

// GET /accounts
exports.list = function list(req, res, next) {
  'use strict';

  // TODO
  // This should probably take a query string for filtering to
  // make it more useful all around.
  // Some ideas:
  // ?classe=5, ?type=ohada, etc...

  var sql =
    'SELECT a.id, a.account_number, a.account_txt, a.parent, at.type ' +
    'FROM account AS a JOIN account_type AS at ON ' +
      'a.account_type_id = at.id';

  if (req.query.type === 'ohada') {
    sql += ' WHERE a.is_ohada = 1';
  }

  sql += ' ORDER BY a.account_number;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


// FIXME Moved from uncategorised - code must be refactored
// --------------------------------------------------------
exports.listInExAccounts = function (req, res, next) {
  var enterprise_id = sanitize.escape(req.params.id_enterprise);
  var sql =
    'SELECT temp.`id`, temp.`account_number`, temp.`account_txt`, temp.`classe`, account_type.`type`, ' +
           'temp.`parent`, temp.`balance`' +  // , temp.`fixed`
    ' FROM (' +
        'SELECT account.id, account.account_number, account.account_txt, account.classe, account.account_type_id, ' +
               'account.parent, period_total.credit - period_total.debit as balance ' +  // account.fixed,
        'FROM account LEFT JOIN period_total ' +
        'ON account.id=period_total.account_id ' +
        'WHERE account.enterprise_id = ' + enterprise_id +
        ' AND (account.classe IN (\'6\', \'7\') OR ((account.classe IN (\'1\', \'2\', \'5\') AND account.is_used_budget = 1) ))' +
    ' ) ' +
    'AS temp JOIN account_type ' +
    'ON temp.account_type_id = account_type.id ' +
    'ORDER BY CAST(temp.account_number AS CHAR(10));';

  function process(accounts) {
    var InExAccounts = accounts.filter(function(item) {
      var account_6_7 = item.account_number.toString().indexOf('6') === 0 || item.account_number.toString().indexOf('7') === 0,
        account_1_2_5 = item.account_number.toString().indexOf('1') === 0 || item.account_number.toString().indexOf('2') === 0 || item.account_number.toString().indexOf('5') === 0;
      return account_6_7 || account_1_2_5;
    });
    return InExAccounts;
  }

  db.exec(sql)
  .then(function (rows) {
    res.send(process(rows));
  })
  .catch(next)
  .done();
};

exports.listEnterpriseAccounts = function (req, res, next) {
  var sql =
    'SELECT account.id, account.account_number, account.account_txt FROM account ' +
    'WHERE account.enterprise_id = ' + sanitize.escape(req.params.id_enterprise) + ' ' +
      'AND account.parent <> 0 ' +
      'AND account.is_ohada = 1 ' +
      'AND account.cc_id IS NULL ' +
      'AND account.account_type_id <> 3';

  function process(accounts) {
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.account_number.toString().indexOf('6') === 0;
    });
    return availablechargeAccounts;
  }

  db.exec(sql)
  .then(function (rows) {
    res.send(process(rows));
  })
  .catch(next)
  .done();
};

exports.listEnterpriseProfitAccounts = function (req, res, next) {
  var sql =
    'SELECT account.id, account.account_number, account.account_txt FROM account ' +
    'WHERE account.enterprise_id = ' + sanitize.escape(req.params.id_enterprise) + ' ' +
      'AND account.parent <> 0 ' +
      'AND account.is_ohada = 1 ' +
      'AND account.pc_id IS NULL ' +
      'AND account.account_type_id <> 3';

  function process(accounts) {
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.account_number.toString().indexOf('7') === 0;
    });
    return availablechargeAccounts;
  }

  db.exec(sql)
  .then(function (rows) {
    res.send(process(rows));
  })
  .catch(next)
  .done();
};

exports.listIncomeAccounts = function (req, res, next) {
  var sql ='SELECT id, enterprise_id, account_number, account_txt FROM account WHERE account_number LIKE "6%" AND account_type_id <> "3"';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listExpenseAccounts = function (req, res, next) {
  var sql ='SELECT id, enterprise_id, account_number, account_txt FROM account WHERE account_number LIKE "7%" AND account_type_id <> "3"';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.getClassSolde = function (req, res, next) {

  var account_class = req.params.account_class,
      fiscal_year_id = req.params.fiscal_year;

  var sql =
    'SELECT `ac`.`id`, `ac`.`account_number`, `ac`.`account_txt`, `ac`.`is_charge`, `t`.`fiscal_year_id`, `t`.`debit`, `t`.`credit`, `t`.`debit_equiv`, `t`.`credit_equiv`, `t`.`currency_id` ' +
    'FROM (' +
      '(' +
        'SELECT `account`.`id`, `posting_journal`.`fiscal_year_id`, `posting_journal`.`project_id`, `posting_journal`.`uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, ' +
          0 + ' AS debit, ' + 0 + ' AS credit, ' +
          'SUM(`posting_journal`.`debit_equiv`) AS `debit_equiv`,' +
          'SUM(`posting_journal`.`credit_equiv`) AS `credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, `posting_journal`.`currency_id`, ' +
          '`posting_journal`.`doc_num`, `posting_journal`.`trans_id`, `posting_journal`.`description`, `posting_journal`.`comment` ' +
        'FROM `posting_journal` JOIN `account` ON `account`.`id`=`posting_journal`.`account_id` WHERE `posting_journal`.`fiscal_year_id`=? AND `account`.`classe`=? GROUP BY `posting_journal`.`account_id` ' +
      ') UNION ALL (' +
        'SELECT `account`.`id`, `general_ledger`.`fiscal_year_id`, `general_ledger`.`project_id`, `general_ledger`.`uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, '+
          0 + ' AS credit, ' + 0 + ' AS debit, ' +
          'SUM(`general_ledger`.`debit_equiv`) AS `debit_equiv`, ' +
          'SUM(`general_ledger`.`credit_equiv`) AS `credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
          '`general_ledger`.`doc_num`, `general_ledger`.`trans_id`, `general_ledger`.`description`, `general_ledger`.`comment` ' +
        'FROM `general_ledger` JOIN `account` ON `account`.`id`=`general_ledger`.`account_id` WHERE `general_ledger`.`fiscal_year_id`=? AND `account`.`classe`=? GROUP BY `general_ledger`.`account_id` ' +
      ')' +
    ') AS `t`, `account` AS `ac` ' +
    'WHERE `t`.`account_id` = `ac`.`id` AND `ac`.`classe`=? AND t.fiscal_year_id = ? ';

  db.exec(sql, [fiscal_year_id, account_class, fiscal_year_id, account_class, account_class, fiscal_year_id])
  .then(function (data) {
    res.send(data);
  })
  .catch(function (err) { next(err); })
  .done();
};

/**
  * Get Type Solde
  * This function is reponsible to return a solde
  * according `account_type`, `account is charge` and `fiscal year` given
  */
exports.getTypeSolde = function (req, res, next) {

  var fiscalYearId = req.params.fiscal_year,
        accountType   = req.params.account_type_id,
        accountIsCharge = req.params.is_charge;

  var sql =
      'SELECT `ac`.`id`, `ac`.`account_number`, `ac`.`account_txt`, `ac`.`account_type_id`, `ac`.`is_charge`, `t`.`fiscal_year_id`, `t`.`debit`, `t`.`credit`, `t`.`debit_equiv`, `t`.`credit_equiv`, `t`.`currency_id` ' +
      'FROM (' +
        '(' +
          'SELECT `account`.`id`, `account`.`account_type_id`, `account`.`is_charge`, `posting_journal`.`fiscal_year_id`, `posting_journal`.`project_id`, `posting_journal`.`uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, ' +
            0 + ' AS debit, ' + 0 + ' AS credit, ' +
            'SUM(`posting_journal`.`debit_equiv`) AS `debit_equiv`,' +
            'SUM(`posting_journal`.`credit_equiv`) AS `credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, `posting_journal`.`currency_id`, ' +
            '`posting_journal`.`doc_num`, `posting_journal`.`trans_id`, `posting_journal`.`description`, `posting_journal`.`comment` ' +
          'FROM `posting_journal` JOIN `account` ON `account`.`id`=`posting_journal`.`account_id` WHERE `posting_journal`.`fiscal_year_id`=? AND `account`.`account_type_id`=? AND `account`.`is_charge`=? GROUP BY `posting_journal`.`account_id` ' +
        ') UNION ALL (' +
          'SELECT `account`.`id`, `account`.`account_type_id`, `account`.`is_charge`, `general_ledger`.`fiscal_year_id`, `general_ledger`.`project_id`, `general_ledger`.`uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, '+
            0 + ' AS credit, ' + 0 + ' AS debit, ' +
            'SUM(`general_ledger`.`debit_equiv`) AS `debit_equiv`, ' +
            'SUM(`general_ledger`.`credit_equiv`) AS `credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, `general_ledger`.`trans_id`, `general_ledger`.`description`, `general_ledger`.`comment` ' +
          'FROM `general_ledger` JOIN `account` ON `account`.`id`=`general_ledger`.`account_id` WHERE `general_ledger`.`fiscal_year_id`=? AND `account`.`account_type_id`=? AND `account`.`is_charge`=? GROUP BY `general_ledger`.`account_id` ' +
        ')' +
      ') AS `t`, `account` AS `ac` ' +
      'WHERE `t`.`account_id` = `ac`.`id` AND (`ac`.`account_type_id`=? AND `ac`.`is_charge`=?) AND t.fiscal_year_id = ? ';

  db.exec(sql, [fiscalYearId, accountType, accountIsCharge, fiscalYearId, accountType, accountIsCharge, accountType, accountIsCharge, fiscalYearId])
  .then(function (data) {
    res.send(data);
  })
  .catch(function (err) { next(err); })
  .done();
};

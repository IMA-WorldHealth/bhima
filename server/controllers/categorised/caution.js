/**
* The Caution Controller
*
* @module categorised/caution
*
* @description This controller is responsible for retrieving journal details of
* a debitor relatives to a caution
*
* @requires lib/db
* @requires lib/sanitize
*/

'use strict';

var db = require('../../lib/db');
var sanitize = require('../../lib/sanitize');

/**
* Getting debitor details from posting journal
*/
exports.debtor = function (req, res, next) {
  var sql, debitor_uuid = sanitize.escape(req.params.debitor_uuid),
      project_id = sanitize.escape(req.params.project_id);
  //prochaine enterprise_id sera obtenue par requette via debitor_id

  sql =
    'SELECT `enterprise`.`currency_id` ' +
    'FROM `enterprise` ' +
    'WHERE `enterprise`.`id` = (SELECT `project`.`enterprise_id` FROM `project` WHERE `project`.`id`='+project_id+')';

  db.exec(sql)
  .then(function (ans) {
    var currency_id = ans.pop().currency_id;
    sql =
      'SELECT `t`.`uuid`, `t`.`trans_id`, `t`.`trans_date`, `t`.`debit_equiv` AS `debit`, ' +
        '`t`.`credit_equiv` AS `credit`, `t`.`description`, `t`.`account_id` ' +
        'FROM (' +
          'SELECT `posting_journal`.`uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`account_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, ' +
            '`posting_journal`.`credit_equiv`, `posting_journal`.`deb_cred_uuid`, ' +
            '`posting_journal`.`trans_id`, `posting_journal`.`description` ' +
          'FROM `posting_journal` WHERE `posting_journal`.`deb_cred_uuid` = ' + debitor_uuid +
        ' UNION ' +
          'SELECT `general_ledger`.`uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`account_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, ' +
            '`general_ledger`.`credit_equiv`, `general_ledger`.`deb_cred_uuid`, ' +
            '`general_ledger`.`trans_id`, `general_ledger`.`description` ' +
          'FROM `general_ledger` WHERE `general_ledger`.`deb_cred_uuid` = ' + debitor_uuid +
        ') AS `t` JOIN `account` ON `t`.`account_id` = `account`.`id` ' +
        'WHERE `t`.`account_id` IN (' +
          'SELECT `debitor_group`.`account_id` FROM `debitor_group` WHERE `debitor_group`.`uuid`= ' +
          '(SELECT `group_uuid` FROM `debitor` WHERE `debitor`.`uuid`=' + debitor_uuid + ' LIMIT 1));';
    return db.exec(sql);
  })
  .then(function (ans) {
    res.send(ans);
  })
  .catch(function (err) {
    next(err);
  })
  .done();
};

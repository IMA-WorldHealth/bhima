var db = require('./../../lib/db');
var sanitize = require('./../../lib/sanitize');

//aB : accountBalance
//pcR : principal caisse balance report by date
//pcRI : principal caisse total income by date
//ccc  : cost center cost
//service profit
//pcv : profit center value

var menu_map = {
  'aB'    : aB,
  'pcR'   : pcR,
  'pcRI'  : pcRI,
  'ccc'   : ccc,
  'sp'    : sp,
  'pcv'   : pcv,
  'ccc_periodic' : ccc_periodic,
  'pcv_periodic' : pcv_periodic
};

function aB (project_id, request, callback){
  var query = JSON.parse(request);
  var acIds = query.accounts.map(function(item){
    return sanitize.escape(item);
  });
  var portion = '`t`.`account_id`='+acIds.join(' OR `t`.`account_id`=');

  var sql =
    'SELECT SUM(`debit_equiv` - `credit_equiv`) as balance, `account_id` '+
    'FROM ((SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `currency_id` FROM `posting_journal`)'+
    ' UNION ALL (SELECT `debit_equiv`, `credit_equiv`, `project_id_id`, `account_id`, `currency_id` FROM `general_ledger`)) as `t`'+
    ' WHERE '+portion+' AND `t`.`project_id`='+sanitize.escape(project_id)+' GROUP BY `account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function pcR (project_id, request, callback){
  var query = JSON.parse(request);
  var acIds = query.accounts.map(function(item){
    return sanitize.escape(item);
  });
  var portion = '';
  if (acIds.length === 1){
    portion = '`t`.`account_id`='+acIds[0];
  }else{
    portion = '`t`.`account_id`='+acIds.join(' OR `t`.`account_id`='); //I think it not important
  }
  var sql = 'SELECT SUM(`debit_equiv` - `credit_equiv`) as balance, trans_date '+
    'FROM ((SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `currency_id`, `trans_date` FROM `posting_journal`)'+
    ' UNION ALL (SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `currency_id`, `trans_date` FROM `general_ledger`)) as `t`'+
    ' WHERE '+portion+' AND `t`.`project_id`='+sanitize.escape(project_id)+' GROUP BY `trans_date` LIMIT 20;';
  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function pcRI (project_id, request, callback){
  var query = JSON.parse(request);
  var acIds = query.accounts.map(function(item){
    return sanitize.escape(item);
  });
  var portion = '';
  if (acIds.length === 1){
    portion = '`t`.`account_id`='+acIds[0];
  }else{
    portion = '`t`.`account_id`='+acIds.join(' OR `t`.`account_id`='); //I think it not important
  }
  var sql = 'SELECT SUM(`debit_equiv`) as total, trans_date '+
    'FROM ((SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `currency_id`, `trans_date` FROM `posting_journal`)'+
    ' UNION ALL (SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `currency_id`, `trans_date` FROM `general_ledger`)) as `t`'+
    ' WHERE '+portion+' AND `t`.`project_id`='+sanitize.escape(project_id)+' GROUP BY `trans_date` LIMIT 20;';
  db.execute(sql, function(err, ans) {
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function ccc (project_id, request, callback){
  var ids = request.accounts.map(function (account) {
    return account.id;
  });

  var ids_conditions_p = (ids.length > 0) ? ' OR `posting_journal`.`account_id` IN (' + ids.join(',') + ')' : '';
  var ids_conditions_g = (ids.length > 0) ? ' OR `general_ledger`.`account_id` IN (' + ids.join(',') + ')' : '';

  var sql =
    'SELECT SUM(`t`.`debit_equiv`) as debit, SUM(`t`.`credit_equiv`) as credit, `t`.`account_id`, `t`.`project_id`, `c`.`account_number`' +
    ' FROM ((SELECT `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`project_id` FROM `posting_journal` LEFT JOIN' +
    ' `cost_center` ON `posting_journal`.`cc_id` = `cost_center`.`id` WHERE `posting_journal`.`cc_id`=' + sanitize.escape(request.cc_id) + ids_conditions_p +
    ' ) UNION ALL (SELECT `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`project_id` FROM `general_ledger` LEFT JOIN' +
    ' `cost_center` ON `general_ledger`.`cc_id` = `cost_center`.`id` WHERE `general_ledger`.`cc_id`=' + sanitize.escape(request.cc_id) + ids_conditions_g +
    ' )) as `t` JOIN `account` as `c` ON `t`.`account_id`=`c`.`id` GROUP BY `t`.`account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function ccc_periodic (project_id, request, callback){
  var ids = request.accounts.map(function (account) {
    return account.id;
  });

  var ids_conditions_p = (ids.length > 0) ? ' OR (`posting_journal`.`account_id` IN (' + ids.join(',') + ') AND (`posting_journal`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') )' : '';
  var ids_conditions_g = (ids.length > 0) ? ' OR (`general_ledger`.`account_id` IN (' + ids.join(',') + ') AND (`general_ledger`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') )' : '';

  var sql =
    'SELECT SUM(`t`.`debit_equiv`) as debit, SUM(`t`.`credit_equiv`) as credit, `t`.`account_id`, `t`.`project_id`, `c`.`account_number`' +
    ' FROM ((SELECT `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`project_id` FROM `posting_journal` LEFT JOIN' +
    ' `cost_center` ON `posting_journal`.`cc_id` = `cost_center`.`id` WHERE (`posting_journal`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') AND `posting_journal`.`cc_id`=' + sanitize.escape(request.cc_id) + ids_conditions_p +
    ' ) UNION ALL (SELECT `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`project_id` FROM `general_ledger` LEFT JOIN' +
    ' `cost_center` ON `general_ledger`.`cc_id` = `cost_center`.`id` WHERE  (`general_ledger`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') AND `general_ledger`.`cc_id`=' + sanitize.escape(request.cc_id) + ids_conditions_g +
    ' )) as `t` JOIN `account` as `c` ON `t`.`account_id`=`c`.`id` GROUP BY `t`.`account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function pcv (project_id, request, callback){
  var ids = request.accounts.map(function (account) {
    return account.id;
  });

  var ids_conditions_p = (ids.length > 0) ? ' OR `posting_journal`.`account_id` IN (' + ids.join(',') + ')' : '';
  var ids_conditions_g = (ids.length > 0) ? ' OR `general_ledger`.`account_id` IN (' + ids.join(',') + ')' : '';

  var sql =
    'SELECT SUM(`t`.`debit_equiv`) as debit, SUM(`t`.`credit_equiv`) as credit, `t`.`account_id`, `t`.`project_id`, `c`.`account_number`' +
    ' FROM (' +
    '(SELECT `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`project_id` FROM `posting_journal` LEFT JOIN' +
    ' `profit_center` ON `posting_journal`.`pc_id` = `profit_center`.`id` WHERE `posting_journal`.`pc_id`=' + sanitize.escape(request.pc_id) + ids_conditions_p +
    ' ) UNION ALL (SELECT `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`project_id` FROM `general_ledger` LEFT JOIN' +
    ' `profit_center` ON `general_ledger`.`pc_id` = `profit_center`.`id` WHERE `general_ledger`.`pc_id`=' + sanitize.escape(request.pc_id) + ids_conditions_g +
    ' )) as `t` JOIN `account` as `c` ON `t`.`account_id`=`c`.`id` GROUP BY `t`.`account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function pcv_periodic (project_id, request, callback){
  var ids = request.accounts.map(function (account) {
    return account.id;
  });

  var ids_conditions_p = (ids.length > 0) ? ' OR (`posting_journal`.`account_id` IN (' + ids.join(',') + ') AND (`posting_journal`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') )' : '';
  var ids_conditions_g = (ids.length > 0) ? ' OR (`general_ledger`.`account_id` IN (' + ids.join(',') + ') AND (`general_ledger`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') )' : '';

  var sql =
    'SELECT SUM(`t`.`debit_equiv`) as debit, SUM(`t`.`credit_equiv`) as credit, `t`.`account_id`, `t`.`project_id`, `c`.`account_number`' +
    ' FROM (' +
    '(SELECT `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`project_id` FROM `posting_journal` LEFT JOIN' +
    ' `profit_center` ON `posting_journal`.`pc_id` = `profit_center`.`id` WHERE (`posting_journal`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') AND `posting_journal`.`pc_id`=' + sanitize.escape(request.pc_id) + ids_conditions_p +
    ' ) UNION ALL (SELECT `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`project_id` FROM `general_ledger` LEFT JOIN' +
    ' `profit_center` ON `general_ledger`.`pc_id` = `profit_center`.`id` WHERE (`general_ledger`.`trans_date` BETWEEN '+sanitize.escape(request.start)+' AND '+sanitize.escape(request.end)+') AND `general_ledger`.`pc_id`=' + sanitize.escape(request.pc_id) + ids_conditions_g +
    ' )) as `t` JOIN `account` as `c` ON `t`.`account_id`=`c`.`id` GROUP BY `t`.`account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    return callback(null, ans);
  });
}

function sp (project_id, request, callback){
  var sql =
    'SELECT SUM(`debit_equiv`) as debit, SUM(`credit_equiv`) as credit, service_id, account_number '+
    'FROM ((SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `service_id` FROM `posting_journal`)'+
    ' UNION ALL (SELECT `debit_equiv`, `credit_equiv`, `project_id`, `account_id`, `service_id` FROM `general_ledger`)) as `t` JOIN `account` ON `account`.`id`=`t`.`account_id` JOIN `service` ON `service`.`id` = `t`.`service_id`'+
    ' WHERE `t`.`project_id`='+sanitize.escape(project_id)+' AND `t`.`service_id`='+sanitize.escape(request.service_id)+' GROUP BY `t`.`account_id`';

  db.execute(sql, function(err, ans){
    if (err) { return callback(err); }
    ans = ans.filter(function (item) {
      return item.account_number.toString().indexOf('7') === 0;
    });
    return callback(null, ans);
  });
}

function menu (goal, project_id, request, callback) {
  return menu_map[goal] ? menu_map[goal](project_id, request, callback) :  new Error('Incorrect/invalid route');
}

module.exports = menu;

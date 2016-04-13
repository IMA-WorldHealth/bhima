/**
* Legacy Reports
*
* @todo -- refactor all of these
*/


var q = require('q');
var querystring = require('querystring');
var url = require('url');

var db = require('./../../lib/db');
var sanitize = require('./../../lib/sanitize');

/*
 * HTTP Controllers
*/
exports.buildReport = function (req, res, next) {
  var route = req.params.route;

  //parse the URL for data following the '?' character
  var query = decodeURIComponent(url.parse(req.url).query);

  generate(route, query, function(report, err) {
    if (err) { return next(err); }
    res.send(report);
  });
};


function buildFinanceQuery(requiredFiscalYears) {
  //TODO currently joins two very seperate querries and just extracts columns from both, these should
  //be combined and calculations (SUM etc.) performed on the single joined table

  var query = [],
      budgetColumns = [],
      realisationColumns = [],
      selectColumns = [],
      differenceColumns = [];

  requiredFiscalYears.forEach(function(fiscal_year) {
    selectColumns.push('budget_result.budget_' + fiscal_year);
    selectColumns.push('period_result.realisation_' + fiscal_year);
    budgetColumns.push('SUM(case when period.fiscal_year_id = ' + fiscal_year +' then budget.budget else 0 end) AS `budget_' + fiscal_year + '`');
    realisationColumns.push('(SUM(case when period_total.fiscal_year_id = ' + fiscal_year + ' then period_total.debit else 0 end) - SUM(case when period_total.fiscal_year_id = ' + fiscal_year + ' then period_total.credit else 0 end)) AS `realisation_' + fiscal_year + '`');
    differenceColumns.push('(SUM(budget_result.budget_1) - SUM(case when period_result.realisation_1 then period_result.realisation_1 else 0 end)) AS `difference_' + fiscal_year + '`');
  });

  query = [
    'SELECT budget_result.account_id, account.number, account.label, account.parent, account.type_id,',
    selectColumns.join(','),
    ',',
    differenceColumns.join(','),
    // ',(SUM(budget_result.budget_1) - SUM(case when period_result.realisation_1 then period_result.realisation_1 else 0 end)) AS `difference_1`',
    'FROM',
    '(SELECT budget.account_id,',
    budgetColumns.join(','),
    'FROM budget inner join period ON',
    'period.id = budget.period_id',
    // 'fiscal_year_id = 1',
    'GROUP BY budget.account_id)',
    'AS `budget_result`',
    'LEFT JOIN',
    '(SELECT period_total.account_id,',
    realisationColumns.join(','),
    'FROM period_total',
    'group by period_total.account_id)',
    'AS `period_result`',
    'ON budget_result.account_id = period_result.account_id',
    'LEFT JOIN',
    'account ON account.id = budget_result.account_id',
    'GROUP BY account.id;'
  ];

  return query.join(' ');
}

function finance(reportParameters) {
  var requiredFiscalYears,
      initialQuery,
      deferred = q.defer(),
      financeParams = JSON.parse(reportParameters);

  if(!financeParams) {
    deferred.reject(new Error('[finance.js] No fiscal years provided'));
    return deferred.promise;
  }

  requiredFiscalYears = financeParams.fiscal;
  initialQuery = buildFinanceQuery(requiredFiscalYears);

  return db.exec(initialQuery);
}

function debtorAging (params){
  var def = q.defer();
  params = JSON.parse(params);
  var requette =
    'SELECT period.id, period.period_start, period.period_stop, debtor.uuid as idDebitor, debtor.text, general_ledger.debit, general_ledger.credit, general_ledger.account_id ' +
    'FROM debtor, debtor_group, general_ledger, period WHERE debtor_group.uuid = debtor.group_uuid AND debtor.uuid = general_ledger.deb_cred_uuid ' +
    'AND general_ledger.`deb_cred_type`=\'D\' AND general_ledger.`period_id` = period.`id` AND general_ledger.account_id = debtor_group.account_id AND general_ledger.`fiscal_year_id`=\''+params.fiscal_id +'\'';

  return db.exec(requette);
}

function accountStatement(params){
  var deferred = q.defer();
  var queryStatus, reportSections, report = {};

  // Parse parameters
  params = JSON.parse(params);
  if (!params.dateFrom || !params.dateTo || !params.accountId) {
    return deferred.reject('Invalid params');
  }

  params.dateFrom = '\'' + params.dateFrom + '\'';
  params.dateTo = '\'' + params.dateTo + '\'';
  params.accountId = '\'' + params.accountId + '\'';

  // Define report sections
  report.overview = {
    query :
      'SELECT COUNT(uuid) as `count`, SUM(debit_equiv) as `debit`, SUM(credit_equiv) as `credit`, SUM(debit_equiv - credit_equiv) as `balance` ' +
      'FROM ( ' +
      'SELECT `posting_journal`.`uuid`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`trans_date` FROM `posting_journal` WHERE' +
      ' `posting_journal`.`account_id`=' + params.accountId + ' UNION SELECT `general_ledger`.`uuid`, `general_ledger`.`debit_equiv`, ' +
      '`general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`trans_date` FROM `general_ledger` WHERE `general_ledger`.`account_id` =' + params.accountId + ')' +
      'as `pg`, account as `a` WHERE `a`.`id` = `pg`.`account_id` AND `pg`.`account_id` = ' + params.accountId + ' AND trans_date >= ' + params.dateFrom + ' AND trans_date <= ' + params.dateTo + ';',
    singleResult : true
  };

  report.account = {
    query :
      'SELECT number, label, type_id, parent, created FROM account where id = ' + params.accountId + ';',
    singleResult : true
  };

  report.detail = {

    query :
      'SELECT debit_equiv, credit_equiv, trans_id, trans_date, description, inv_po_id ' +
      'FROM ( ' +
      'SELECT `posting_journal`.`uuid`, posting_journal.trans_id, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`account_id`, `posting_journal`.`trans_date`, `posting_journal`.`description`, `posting_journal`.`inv_po_id` FROM `posting_journal` WHERE' +
      ' `posting_journal`.`account_id`=' + params.accountId + ' UNION SELECT `general_ledger`.`uuid`, general_ledger.trans_id, `general_ledger`.`debit_equiv`, ' +
      '`general_ledger`.`credit_equiv`, `general_ledger`.`account_id`, `general_ledger`.`trans_date`, `general_ledger`.`description`, `general_ledger`.`inv_po_id` FROM `general_ledger` WHERE `general_ledger`.`account_id` =' + params.accountId + ')' +
      'as `pg`, account as `a` WHERE `a`.`id` = `pg`.`account_id` AND `pg`.`account_id` = ' + params.accountId + ' AND trans_date >= ' + params.dateFrom + ' AND trans_date <= ' + params.dateTo + ' ORDER BY trans_date DESC LIMIT ' + params.limit + ';',
    singleResult : false
  };

  // Execute querries
  reportSections = Object.keys(report);
  queryStatus = reportSections.map(function (key) {
    return db.exec(report[key].query);
  });

  // Handle results
  q.all(queryStatus)
    .then(function (result) {
      var packageResponse = {};

      reportSections.forEach(function (key, index) {
        var parseResult = report[key].singleResult ? result[index][0] : result[index];
        packageResponse[key] = report[key].result = parseResult;
      });

      // Ensure we found an account
      if (!report.account.result) {
        return deferred.reject(new Error('Unknown account ' + params.accountId));
      }

      deferred.resolve(packageResponse);
    })
    .catch(function (error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function saleRecords(params) {
  var deferred = q.defer();
  params = JSON.parse(params);

  if (!params.dateFrom || !params.dateTo) {
    return q.reject(new Error('Invalid date parameters'));
  }

  var requestSql =
    'SELECT sale.uuid, sale.reference, sale.cost, sale.currency_id, sale.debtor_uuid, sale.invoice_date, ' +
    'sale.note, sale.posted, sale.seller_id, credit_note.uuid as `creditId`, credit_note.description as `creditDescription`, ' +
    'credit_note.posted as `creditPosted`, first_name, last_name, middle_name, patient.project_id as `patientProjectId`, patient.reference as `patientReference`, project.abbr as `projectAbbr`, CONCAT(project.abbr, sale.reference) as `hr_id` ' +
    'FROM sale LEFT JOIN credit_note on sale.uuid = credit_note.sale_uuid ' +
    'LEFT JOIN patient on sale.debtor_uuid = patient.debtor_uuid ' +
    'LEFT JOIN project on sale.project_id = project.id ' +
    'WHERE sale.invoice_date >= ? AND sale.invoice_date <= ? ';

  if (params.project && params.user) {
    requestSql += ('AND sale.project_id= ? AND sale.seller_id= ? ');
    requestSql += 'ORDER BY sale.timestamp DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.project, params.user]);
  } else if (params.project && !params.user) {
    requestSql += ('AND sale.project_id= ? ');
    requestSql += 'ORDER BY sale.timestamp DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.project]);
  } else if (!params.project && params.user) {
    requestSql += ('AND sale.seller_id= ? ');
    requestSql += 'ORDER BY sale.timestamp DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.user]);
  } else {
    requestSql += 'ORDER BY sale.timestamp DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo]);
  }
}

function cashAuxillaryRecords(params) {
  var deferred = q.defer();
  params = JSON.parse(params);

  if (!params.dateFrom || !params.dateTo) {
    return q.reject(new Error('Invalid date parameters'));
  }

  var requestSql =
    'SELECT cash.uuid, cash.reference, cash.cost, cash.currency_id, cash.deb_cred_uuid, cash.date, cash.is_caution, ' +
    'cash.description, cash_discard.uuid as `cashDiscardId`, cash_discard.description as `cashDiscardDescription`, ' +
    'cash_discard.posted, cash.user_id, first_name, middle_name, last_name, patient.reference as `patientReference`,  project.abbr as `projectAbbr`, CONCAT(project.abbr, cash.reference) as `hr_id` ' +
    'FROM cash LEFT JOIN cash_discard on cash.uuid = cash_discard.cash_uuid ' +
    'LEFT JOIN patient on cash.deb_cred_uuid = patient.debtor_uuid ' +
    'LEFT JOIN project on cash.project_id = project.id ' +
    'WHERE cash.date >= ? AND cash.date <= ? ';

  if (params.project && params.user) {
    requestSql += ('AND cash.project_id= ? AND cash.user_id= ? ');
    requestSql += 'ORDER BY cash.date DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.project, params.user]);
  } else if (params.project && !params.user) {
    requestSql += ('AND cash.project_id= ? ');
    requestSql += 'ORDER BY cash.date DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.project]);
  } else if (!params.project && params.user) {
    requestSql += ('AND cash.user_id= ? ');
    requestSql += 'ORDER BY cash.date DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo, params.user]);
  } else {
    requestSql += 'ORDER BY cash.date DESC;';
    return db.exec(requestSql, [params.dateFrom, params.dateTo]);
  }
}

function distributionPatients(params) {
  var deferred = q.defer();
  params = JSON.parse(params);

  if (!params.dateFrom || !params.dateTo) {
    return q.reject(new Error('Invalid date parameters'));
  }

  var requestSql =
    'SELECT `consumption_patient`.`consumption_uuid`, `consumption`.`document_id`, COUNT(`consumption`.`document_id`) AS `nr_item`, ' +
    ' `consumption_patient`.`patient_uuid`, `patient`.`uuid`, `patient`.`first_name`,`patient`.`last_name`, `patient`.`reference`, ' +
    '`consumption`.`date`, `depot`.`text`, (`sale`.`reference`) AS refSale, `consumption_patient`.`sale_uuid`, ' +
    '(`consumption_reversing`.`consumption_uuid`) AS reversingUuid, `consumption_reversing`.`description`, `project`.`abbr` ' +
    'FROM `consumption_patient` ' +
    'JOIN `consumption` ON `consumption`.`uuid` =  `consumption_patient`.`consumption_uuid` ' +
    'JOIN `patient` ON `patient`.`uuid` =  `consumption_patient`.`patient_uuid` ' +
    'JOIN `depot` ON `depot`.`uuid` = `consumption`.`depot_uuid` ' +
    'JOIN `stock` ON `stock`.`tracking_number` = `consumption`.`tracking_number` ' +
    'JOIN `inventory` ON `inventory`.`uuid` = `stock`.`inventory_uuid` ' +
    'JOIN `sale` ON `sale`.`uuid` = `consumption`.`document_id` ' +
    'JOIN `project` ON `project`.`id` = `sale`.`project_id` ' +
    'LEFT JOIN `consumption_reversing` ON `consumption_reversing`.`consumption_uuid` = `consumption`.`uuid` ' +
    'WHERE `depot`.`uuid` = ? AND `consumption`.`date` >= ? AND `consumption`.`date` <= ? ' +
    'GROUP BY `consumption`.`document_id` ' +
    'ORDER BY `consumption`.`date` DESC, `patient`.`first_name` ASC, `patient`.`last_name` ASC ';

  return db.exec(requestSql, [params.depotId, params.dateFrom, params.dateTo]);
}

function distributionServices(params) {
  var deferred = q.defer();
  params = JSON.parse(params);

  if (!params.dateFrom || !params.dateTo) {
    return q.reject(new Error('Invalid date parameters'));
  }

  var requestSql =
    'SELECT `consumption_service`.`consumption_uuid`, `consumption`.`document_id`, COUNT(`consumption`.`document_id`) AS `itemNumers`, `consumption_service`.`service_id`, `service`.`name`, ' +
    '`consumption`.`date`, `depot`.`text`, ' +
    '(`consumption_reversing`.`consumption_uuid`) AS reversingUuid, `consumption_reversing`.`description`' +
    'FROM `consumption_service` ' +
    'JOIN `consumption` ON `consumption`.`uuid` =  `consumption_service`.`consumption_uuid` ' +
    'JOIN `service` ON `service`.`id` =  `consumption_service`.`service_id` ' +
    'JOIN `depot` ON `depot`.`uuid` = `consumption`.`depot_uuid` ' +
    'JOIN `stock` ON `stock`.`tracking_number` = `consumption`.`tracking_number` ' +
    'JOIN `inventory` ON `inventory`.`uuid` = `stock`.`inventory_uuid` ' +
    'LEFT JOIN `consumption_reversing` ON `consumption_reversing`.`consumption_uuid` = `consumption`.`uuid` ' +
    'WHERE `depot`.`uuid` = ? AND `consumption`.`date` >= ? AND `consumption`.`date` <= ? ' +
    'GROUP BY `consumption`.`document_id` ' +
    'ORDER BY `consumption`.`date` DESC, `service`.`name` ASC';

  return db.exec(requestSql, [params.depotId, params.dateFrom, params.dateTo]);
}



function patientRecords(params) {
  var p = querystring.parse(params),
      deferred = q.defer();

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end).setDate(new Date(p.end).getDate() + 1)),
      _id;

  if (p.id.indexOf(',')) {
    _id = p.id.split(',').map(function (id) { return sanitize.escape(id); }).join(',');
  } else {
    _id = p.id;
  }

  var sql =
    'SELECT patient.uuid, patient.reference, project.abbr, debtor_uuid, first_name, middle_name, hospital_no, last_name, dob, father_name, ' +
        'sex, religion, renewal, registration_date, date, CONCAT(user.first,\' \',user.last) AS registrar ' +
      'FROM `patient` JOIN `patient_visit` JOIN `project` JOIN `user` ON ' +
        '`patient`.`uuid`=`patient_visit`.`patient_uuid` AND ' +
        '`patient`.`project_id`=`project`.`id` AND ' +
        '`patient_visit`.`registered_by` = `user`.`id` ' +
      'WHERE `date` >= ' + _start + ' AND ' +
        ' `date` <= ' + _end + ' AND `project_id` IN (' + _id + ');';

  return db.exec(sql);
}

function patientNewVisit(params) {
  var p = querystring.parse(params),
      deferred = q.defer();

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end).setDate(new Date(p.end).getDate() + 1)),
      _id;

  if (p.id.indexOf(',')) {
    _id = p.id.split(',').map(function (id) { return sanitize.escape(id); }).join(',');
  } else {
    _id = p.id;
  }

  var sql =
    'SELECT patient.uuid, patient.reference, project.abbr, debtor_uuid, first_name, middle_name, hospital_no, last_name, dob, father_name, ' +
        'sex, religion, renewal, registration_date, date, CONCAT(user.first,\' \',user.last) AS registrar ' +
      'FROM `patient` JOIN `patient_visit` JOIN `project` JOIN `user` ON ' +
        '`patient`.`uuid`=`patient_visit`.`patient_uuid` AND ' +
        '`patient`.`project_id`=`project`.`id` AND ' +
        '`patient_visit`.`registered_by` = `user`.`id` ' +
      'WHERE `date` >= ' + _start + ' AND `date` <= ' + _end + ' ' +
      'AND patient_visit.date = patient.registration_date ' +
      'AND `project_id` IN (' + _id + ');';

  return db.exec(sql);
}

function patientOldVisit(params) {
  var p = querystring.parse(params),
      deferred = q.defer();

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end).setDate(new Date(p.end).getDate() + 1)),
      _id;

  if (p.id.indexOf(',')) {
    _id = p.id.split(',').map(function (id) { return sanitize.escape(id); }).join(',');
  } else {
    _id = p.id;
  }

  var sql =
    'SELECT patient.uuid, patient.reference, project.abbr, debtor_uuid, first_name, middle_name, hospital_no, last_name, dob, father_name, ' +
        'sex, religion, renewal, registration_date, date, CONCAT(user.first,\' \',user.last) AS registrar ' +
      'FROM `patient` JOIN `patient_visit` JOIN `project` JOIN `user` ON ' +
        '`patient`.`uuid`=`patient_visit`.`patient_uuid` AND ' +
        '`patient`.`project_id`=`project`.`id` AND ' +
        '`patient_visit`.`registered_by` = `user`.`id` ' +
      'WHERE `date` >= ' + _start + ' AND `date` <= ' + _end + ' ' +
      'AND patient_visit.date <> patient.registration_date ' +
      'AND `project_id` IN (' + _id + ');';

  return db.exec(sql);
}

function paymentRecords(params) {
  var p = querystring.parse(params);

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end)),
      _id = p.id;

  var sql =
    '(SELECT c.uuid, c.document_id, c.reference, s.reference AS sale_reference, s.project_id AS sale_project, ' +
      'pr.abbr, c.cost, cr.name, p.first_name, c.description, p.project_id AS debtor_project, p.reference AS debtor_reference , ' +
      'p.last_name, c.deb_cred_uuid, c.currency_id, ci.invoice_uuid, c.date, cd.cash_uuid AS `cash_discard` ' +
    'FROM `cash` AS c ' +
      'JOIN project AS pr ON c.project_id = pr.id ' +
      'JOIN `currency` AS cr ON c.currency_id = cr.id ' +
      'JOIN `cash_item` AS ci ON ci.cash_uuid = c.uuid ' +
      'JOIN `debtor` AS d ON c.deb_cred_uuid = d.uuid ' +
      'JOIN `patient` AS p ON d.uuid = p.debtor_uuid ' +
      'JOIN sale AS s ON ci.invoice_uuid = s.uuid ' +
      'LEFT JOIN `cash_discard` AS cd  ON c.uuid = cd.cash_uuid ' +
    'WHERE c.project_id IN (' + _id + ') AND DATE(c.date) BETWEEN DATE(' + _start + ') AND DATE(' + _end + ') AND cd.cash_uuid IS NULL ' +
    'GROUP BY c.document_id);';


  return db.exec(sql);
}

function patientStanding(params) {
  params = querystring.parse(params);
  var id = params.id,
      account_id = params.account_id,
      patient = {},
      defer = q.defer(),
      sql =
      'SELECT `aggregate`.`uuid`, `aggregate`.`trans_id`, `aggregate`.`trans_date`, `aggregate`.`account_id`, sum(`aggregate`.`credit_equiv`) as credit, sum(`aggregate`.`debit_equiv`) as debit, `aggregate`.`description`, `aggregate`.`inv_po_id`, `aggregate`.`account_id`, `aggregate`.`is_convention` ' +
      'FROM ( ' +
        'SELECT `posting_journal`.`uuid`, `posting_journal`.`trans_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`description`, `posting_journal`.`inv_po_id`, `posting_journal`.`account_id`, `debtor_group`.`is_convention` ' +
        'FROM `posting_journal` ' +
        'JOIN `debtor_group` ON `debtor_group`.`account_id` =  `posting_journal`.`account_id` ' +
        'WHERE `posting_journal`.`deb_cred_uuid`= ? AND `debtor_group`.`account_id`= ? AND `posting_journal`.`deb_cred_type`=\'D\' AND `debtor_group`.`is_convention` = 0 ' +
      'UNION ' +
        'SELECT `general_ledger`.`uuid`, `general_ledger`.`trans_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`description`, `general_ledger`.`inv_po_id`, `general_ledger`.`account_id`, `debtor_group`.`is_convention` ' +
        'FROM `general_ledger` ' +
        'JOIN `debtor_group` ON `debtor_group`.`account_id` =  `general_ledger`.`account_id` ' +
        'WHERE `general_ledger`.`deb_cred_uuid`= ? AND `debtor_group`.`account_id`= ? AND `general_ledger`.`deb_cred_type`=\'D\' AND `debtor_group`.`is_convention` = 0) as aggregate ' +
      'GROUP BY `aggregate`.`inv_po_id` ORDER BY `aggregate`.`trans_date` DESC;';

  db.exec(sql, [params.id, params.account_id, params.id, params.account_id])
  .then(function (rows) {

    if (!rows.length) { return defer.resolve([]); }
    patient.receipts = rows;
    defer.resolve(patient);

  })
  .catch(function (err) {
    defer.reject(err);
  });

  return defer.promise;
}

function employeeStanding(params) {
  params = querystring.parse(params);
  var id = sanitize.escape(params.id),
      employee = {},
      defer = q.defer(),
      sql =
      'SELECT `aggregate`.`uuid`, `aggregate`.`trans_id`, `aggregate`.`trans_date`, sum(`aggregate`.`credit_equiv`) as credit, sum(`aggregate`.`debit_equiv`) as debit, `aggregate`.`description`, `aggregate`.`inv_po_id` ' +
      'FROM (' +
        'SELECT `posting_journal`.`uuid`, `posting_journal`.`trans_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`description`, `posting_journal`.`inv_po_id` ' +
        'FROM `posting_journal` ' +
        'JOIN `transaction_type` ON `transaction_type`.`id`= `posting_journal`.`origin_id` '+
        ' WHERE `posting_journal`.`deb_cred_uuid`= ? AND `posting_journal`.`deb_cred_type`=\'C\' ' +
      'UNION ' +
        'SELECT `general_ledger`.`uuid`, `general_ledger`.`trans_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`description`, `general_ledger`.`inv_po_id` ' +
        'FROM `general_ledger` ' +
        'JOIN `transaction_type` ON `transaction_type`.`id`= `general_ledger`.`origin_id` '+
        'WHERE `general_ledger`.`deb_cred_uuid`=? AND `general_ledger`.`deb_cred_type`=\'C\') as aggregate ' +
      'GROUP BY `aggregate`.`inv_po_id` ORDER BY `aggregate`.`trans_date` DESC;';

  db.exec(sql,[params.id, params.id])
  .then(function (rows) {
    if (!rows.length) { return defer.resolve([]); }

    employee.receipts = rows;
    sql =
      'SELECT trans_date FROM (' +
      ' SELECT trans_date FROM `posting_journal` WHERE `posting_journal`.`deb_cred_uuid`=? AND `posting_journal`.`deb_cred_type`=\'C\' ' +
      'AND `posting_journal`.`origin_id`=(SELECT `transaction_type`.`id` FROM `transaction_type` WHERE `transaction_type`.`service_txt`=\'cash\' OR `transaction_type`.`service_txt`=\'caution\' LIMIT 1)' +
      ' UNION ' +
      'SELECT trans_date FROM `general_ledger` WHERE `general_ledger`.`deb_cred_uuid`=? AND `general_ledger`.`deb_cred_type`=\'C\' ' +
      'AND `general_ledger`.`origin_id`=(SELECT `transaction_type`.`id` FROM `transaction_type` WHERE `transaction_type`.`service_txt`=\'cash\' OR `transaction_type`.`service_txt`=\'caution\' LIMIT 1)' +
      ') as aggregate ORDER BY trans_date DESC LIMIT 1;';

    return db.exec(sql, [params.id, params.id]);
  })
  .then(function (rows) {
    if (!rows.length) {
      employee.last_payment_date = undefined;
    } else {
      var row = rows.pop();
      employee.last_payment_date = row.trans_date;
    }
    defer.resolve(employee);
  })
  .catch(function (err) {
    defer.reject(err);
  });

  return defer.promise;
}

function employeeStandingV2(params) {
  params = querystring.parse(params);
  var id = sanitize.escape(params.id),
      defer = q.defer(), sql, personnelId;

  // Getting the employees account
  sql = 'SELECT cg.account_id FROM creditor c ' +
        'JOIN creditor_group cg ON cg.uuid = c.group_uuid ' +
        'WHERE c.uuid = ?';

  db.exec(sql, [params.id])
  .then(function (rows) {
    if (!rows.length) { return defer.resolve([]); }
    personnelId = rows[0].account_id;
    // Getting cotisation and tax fot employees
    sql = 'SELECT aggregate.four_account_id FROM (' +
          'SELECT t.four_account_id FROM tax t WHERE t.is_employee = 1 '+
          ' UNION ' +
          'SELECT c.four_account_id FROM cotisation c WHERE c.is_employee = 1 ) AS aggregate ';
    return db.exec(sql);
  })
  .then(function (rows) {
    // serialize rows
    var serial = rows.map(function (row) {
      var arr = [];
      for (var i in row) {
        arr.push(row[i]);
      }
      return arr.join(',');
    });

    serial = serial.concat(personnelId);

    sql =
    'SELECT `aggregate`.`uuid`, `aggregate`.`trans_id`, `aggregate`.`trans_date`, sum(`aggregate`.`credit_equiv`) as credit, sum(`aggregate`.`debit_equiv`) as debit, `aggregate`.`description`, `aggregate`.`inv_po_id` ' +
    'FROM (' +
      'SELECT `posting_journal`.`uuid`, `posting_journal`.`trans_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, `posting_journal`.`description`, `posting_journal`.`inv_po_id` ' +
      'FROM `posting_journal` ' +
      'JOIN `transaction_type` ON `transaction_type`.`id`= `posting_journal`.`origin_id` '+
      'WHERE `posting_journal`.`deb_cred_uuid`= ? AND `posting_journal`.`deb_cred_type`=\'C\' AND `posting_journal`.`account_id` IN (' + serial.join(',') + ') ' +
    'UNION ' +
      'SELECT `general_ledger`.`uuid`, `general_ledger`.`trans_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, `general_ledger`.`description`, `general_ledger`.`inv_po_id` ' +
      'FROM `general_ledger` ' +
      'JOIN `transaction_type` ON `transaction_type`.`id`= `general_ledger`.`origin_id` '+
      'WHERE `general_ledger`.`deb_cred_uuid`=? AND `general_ledger`.`deb_cred_type`=\'C\' AND `general_ledger`.`account_id` IN (' + serial.join(',') + ') ) as aggregate ' +
    'GROUP BY `aggregate`.`trans_id` ORDER BY `aggregate`.`trans_date` DESC;';

    return db.exec(sql,[params.id, params.id]);
  })
  .then(function (rows) {
    if (!rows.length) { return defer.resolve([]); }
    defer.resolve(rows);
  })
  .catch(function (err) {
    defer.reject(err);
  });

  return defer.promise;
}


function cotisation_payment(params) {
  params = querystring.parse(params);
  var id = params.id,
    cotisation_id = params.cotisation_id,
    sql;

  sql =
    'SELECT e.id, e.code, e.prenom, e.name, e.postnom, e.creditor_uuid, p.uuid as paiement_uuid, ' +
    'p.currency_id, t.label, t.abbr, z.cotisation_id, z.value, z.posted ' +
    'FROM employee e ' +
    'JOIN paiement p ON e.id=p.employee_id ' +
    'JOIN cotisation_paiement z ON z.paiement_uuid=p.uuid ' +
    'JOIN cotisation t ON t.id=z.cotisation_id ' +
    'WHERE p.paiement_period_id= ? AND z.cotisation_id= ? ' +
    ' ORDER BY e.name ASC, e.postnom ASC, e.prenom ASC';

  return db.exec(sql, [id, cotisation_id]);
}

function taxes_payment(params) {
  params = querystring.parse(params);

  var id = params.id,
      tax_id = params.tax_id,
    sql;

  sql =
    'SELECT e.id, e.code, e.prenom, e.name, e.postnom, e.creditor_uuid, p.uuid as paiement_uuid, ' +
    'p.currency_id, t.label, t.abbr, z.tax_id, z.value, z.posted ' +
    'FROM employee e ' +
    'JOIN paiement p ON e.id=p.employee_id ' +
    'JOIN tax_paiement z ON z.paiement_uuid=p.uuid ' +
    'JOIN tax t ON t.id=z.tax_id ' +
    'WHERE p.paiement_period_id= ? AND z.tax_id= ? ' +
    ' ORDER BY e.name ASC, e.postnom ASC, e.prenom ASC';
  return db.exec(sql, [id, tax_id]);
}

function employeePaiement(params) {
  params = querystring.parse(params);
  var sql, id = sanitize.escape(params.id);
  sql =
    'SELECT employee.code, employee.prenom, employee.postnom, employee.name, employee.creditor_uuid, ' +
    'paiement.uuid, creditor_group.account_id AS creditor_account, paiement.currency_id, paiement.net_before_tax, paiement.net_after_tax, ' +
    'paiement.net_salary, paiement.is_paid, currency.symbol, SUM(partial_paiement.amount) AS amount ' +
    'FROM employee ' +
    'JOIN creditor ON creditor.uuid = employee.creditor_uuid ' +
    'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
    'JOIN paiement ON paiement.employee_id = employee.id ' +
    'JOIN currency ON currency.id = paiement.currency_id ' +
    'LEFT JOIN partial_paiement ON partial_paiement.paiement_uuid = paiement.uuid ' +
    'WHERE paiement.paiement_period_id = ' + id +
    'GROUP BY partial_paiement.paiement_uuid, paiement.employee_id ' +
    'ORDER BY employee.name ASC, employee.postnom ASC, employee.prenom ASC';

  return db.exec(sql);
}


function stockLocation (params) {
  var p = querystring.parse(params);
  var sql, id = sanitize.escape(p.id);

  sql =
    'SELECT inventory_uuid, stock.tracking_number, direction, expiration_date, ' +
      'SUM(stock_movement.quantity) as quantity, depot.text ' +
    'FROM stock_movement JOIN stock JOIN depot ' +
      'ON stock_movement.tracking_number = stock.tracking_number AND ' +
      'stock_movement.depot_id = depot.id ' +
    'WHERE inventory_uuid = ? ' +
    'GROUP BY tracking_number, depot_id, direction;';
  return db.exec(sql, [id]);
}

function stockCount () {
  var sql;

  sql =
    'SELECT uuid, code, text, name, SUM(quantity) AS quantity FROM (' +
      'SELECT inventory.uuid, inventory.code, text, name ' +
      'FROM inventory JOIN inventory_group ON inventory.group_uuid = inventory_group.uuid ' +
      'WHERE type_id = 0' +
    ') AS inv ' +
    'LEFT JOIN stock ON stock.inventory_uuid = inv.uuid ' +
    'GROUP BY uuid;';

  return db.exec(sql);
}

function priceReport () {
  var sql, defer = q.defer();

  sql =
    'SELECT inventory.code, text, price, inventory_group.code AS group_code, name, price ' +
    'FROM inventory JOIN inventory_group WHERE inventory.group_uuid = inventory_group.uuid ' +
    'ORDER BY inventory_group.code;';

  db.exec(sql)
  .then(function (data) {
    var groups = {};
    data.forEach(function (row) {
      if (!groups[row.group_code]) {
        groups[row.group_code] = {};
        groups[row.group_code].name = row.name;
        groups[row.group_code].code = row.group_code;
        groups[row.group_code].rows = [];
      }
      groups[row.group_code].rows.push(row);
    });

    defer.resolve(groups);
  })
  .catch(function (error) { defer.reject(error); });

  return defer.promise;
}

function transactionsByAccount(params) {
  var p, sql, _account, _limit;

  p = querystring.parse(params);
  _account = sanitize.escape(p.account);
  _limit = p.limit;

  sql =
    'SELECT uuid, trans_date, description, number, debit, credit, currency_id ' +
    'FROM (' +
      'SELECT uuid, trans_date, description, account_id, debit, credit, currency_id ' +
      'FROM posting_journal ' +
    'UNION ' +
      'SELECT uuid, trans_date, description, account_id, debit, credit, currency_id ' +
      'FROM general_ledger' +
    ') AS journal JOIN account ON ' +
      'journal.account_id = account.id ' +
    'WHERE account.id = ' + _account + ' ' +
    'LIMIT ' + _limit + ';';

  return db.exec(sql);
}

function incomeReport (params) {
  params = JSON.parse(params);
  var defer = q.defer(),
    requette =
      'SELECT `t`.`uuid`, `t`.`trans_id`, `t`.`trans_date`, `a`.`number`, `t`.`debit_equiv`,  ' +
      '`t`.`credit_equiv`, SUM(`t`.`debit`) AS `debit`, SUM(`t`.`credit`) AS `credit`, `t`.`currency_id`, `t`.`description`, `t`.`comment`, `t`.`primary_cash_uuid`, `o`.`service_txt`, `u`.`first`, `u`.`last` ' +
      'FROM (' +
        '(' +
          'SELECT `posting_journal`.`project_id`, `posting_journal`.`uuid`,`primary_cash_item`.`primary_cash_uuid`, `primary_cash_item`.`document_uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, ' +
            '`posting_journal`.`credit_equiv`, `posting_journal`.`debit`, `posting_journal`.`credit`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, '+
            '`posting_journal`.`currency_id`, `posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment`, `posting_journal`.`origin_id`, `posting_journal`.`user_id` ' +
          'FROM `posting_journal` ' +
      'JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `posting_journal`.`inv_po_id`  ' +
      ') UNION (' +
          'SELECT `general_ledger`.`project_id`, `general_ledger`.`uuid`,`primary_cash_item`.`primary_cash_uuid`,`primary_cash_item`.`document_uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, ' +
            '`general_ledger`.`credit_equiv`, `general_ledger`.`debit`, `general_ledger`.`credit`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment`, `general_ledger`.`origin_id`, `general_ledger`.`user_id` ' +
          'FROM `general_ledger` ' +
      'JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `general_ledger`.`inv_po_id`  ' +
        ')' +
      ') AS `t`, account AS a, transaction_type as o, user as u WHERE `t`.`account_id` = `a`.`id` AND `t`.`origin_id` = `o`.`id` AND `t`.`user_id` = `u`.`id` AND `t`.`account_id`= ?'  +
      ' AND `t`.`trans_date` >=? AND `t`.`trans_date` <= ? GROUP BY `t`.`trans_id`;';
  db.exec(requette,[params.account_id, params.dateFrom, params.dateTo])
   .then(function (results) {
    results = results.filter(function (item) {
      return item.debit > 0;
    });
    defer.resolve(results);
   })
   .catch(function (err) {
    defer.reject(err);
  });
  return defer.promise;
}

function expenseReport (params) {
  params = JSON.parse(params);
  var defer = q.defer(),
    requette =
      'SELECT `t`.`uuid`, `t`.`trans_id`, `t`.`trans_date`, `a`.`number`, `t`.`debit_equiv`,  ' +
      '`t`.`credit_equiv`, `t`.`debit`, `t`.`credit`, `t`.`currency_id`, `t`.`description`, `t`.`comment`, `t`.`primary_cash_uuid`, `t`.`document_uuid`, `t`.`inv_po_id`, `o`.`service_txt`, `u`.`first`, `u`.`last` ' +
      'FROM (' +
        '(' +
          'SELECT `posting_journal`.`project_id`, `posting_journal`.`uuid`, `primary_cash_item`.`primary_cash_uuid`, `primary_cash_item`.`document_uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, ' +
            '`posting_journal`.`credit_equiv`, `posting_journal`.`debit`, `posting_journal`.`credit`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, '+
            '`posting_journal`.`currency_id`, `posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment`, `posting_journal`.`origin_id`, `posting_journal`.`user_id` ' +
          'FROM `posting_journal` ' +
      'LEFT JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `posting_journal`.`inv_po_id`  ' +
        ') UNION (' +
          'SELECT `general_ledger`.`project_id`, `general_ledger`.`uuid`, `primary_cash_item`.`primary_cash_uuid`, `primary_cash_item`.`document_uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, ' +
            '`general_ledger`.`credit_equiv`, `general_ledger`.`debit`, `general_ledger`.`credit`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment`, `general_ledger`.`origin_id`, `general_ledger`.`user_id` ' +
          'FROM `general_ledger` ' +
      'LEFT JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `general_ledger`.`inv_po_id`  ' +
        ')' +
      ') AS `t`, account AS a, transaction_type as o, user as u WHERE `t`.`account_id` = `a`.`id` AND `t`.`origin_id` = `o`.`id` AND `t`.`user_id` = `u`.`id` AND `t`.`account_id`= ?'   +
      ' AND `t`.`trans_date` >=? AND `t`.`trans_date` <=?;';


  db.exec(requette, [params.account_id, params.dateFrom, params.dateTo])
   .then(function (results) {
    results = results.filter(function (item) {
      return item.credit > 0;
    });
    defer.resolve(results);
   })
   .catch(function (err) {
    defer.reject(err);
  });
  return defer.promise;
}

function allTransactions (params){
  var source = {
    '0' : 0,
    '1' : 'posting_journal',
    '2' : 'general_ledger'
  };
  var def = q.defer();
  params = querystring.parse(params);
  var requette;
  var suite_account = (params.account_id && params.account_id > 0)? ' AND transact.account_id=' + sanitize.escape(params.account_id) : '';
  var suite_dates = (params.datef && params.datet)? ' AND transact.trans_date >= ' + sanitize.escape(params.datef) + ' AND transact.trans_date <= ' + sanitize.escape(params.datet) : '';

  if (params.source && params.source > 0) {
    var sub_chaine = [
      'uuid, ', 'inv_po_id, ',
      'trans_date, ', 'debit_equiv, ',
      'credit_equiv, ', 'account_id, ',
      'deb_cred_uuid, ', 'currency_id, ', 'doc_num, ',
      'trans_id, ', 'description, ', 'comment '
    ].join(source[params.source] + '.');
    sub_chaine = source[params.source] + '.' + sub_chaine;

    requette =
      'SELECT transact.uuid, transact.trans_id, transact.trans_date, ac.number, transact.debit_equiv AS debit,  ' +
      'transact.credit_equiv AS credit, transact.currency_id, transact.description, transact.comment ' +
      'FROM (' +
        'SELECT ' + sub_chaine + 'FROM ' + source[params.source] +
      ') AS transact, account AS ac WHERE transact.account_id = ac.id' + suite_account + suite_dates;

  } else {
    requette =
      'SELECT transact.uuid, transact.trans_id, transact.trans_date, ac.number, transact.debit_equiv AS debit,  ' +
      'transact.credit_equiv AS credit, transact.currency_id, transact.description, transact.comment ' +
      'FROM (' +
        '(' +
          'SELECT posting_journal.project_id, posting_journal.uuid, posting_journal.inv_po_id, posting_journal.trans_date, posting_journal.debit_equiv, ' +
            'posting_journal.credit_equiv, posting_journal.account_id, posting_journal.deb_cred_uuid, posting_journal.currency_id, ' +
            'posting_journal.doc_num, posting_journal.trans_id, posting_journal.description, posting_journal.comment ' +
          'FROM posting_journal ' +
        ') UNION (' +
          'SELECT general_ledger.project_id, general_ledger.uuid, general_ledger.inv_po_id, general_ledger.trans_date, general_ledger.debit_equiv, ' +
            'general_ledger.credit_equiv, general_ledger.account_id, general_ledger.deb_cred_uuid, general_ledger.currency_id, ' +
            'general_ledger.doc_num, general_ledger.trans_id, general_ledger.description, general_ledger.comment ' +
          'FROM general_ledger ' +
        ')' +
      ') AS transact, account AS ac WHERE transact.account_id = ac.id' + suite_account + suite_dates;
  }

  return db.exec(requette);
}


function stock_movement (params){
  params = querystring.parse(params);

  var requette =
    'SELECT `m`.`uuid`, `m`.`document_id`, `m`.`depot_entry`,  `m`.`depot_exit`, `m`.`document_id`,' +
    '`m`.`tracking_number`, `m`.`quantity`, `m`.`date`, `ex`.`text` AS `exit_text`, `ex`.`uuid`, `en`.`text` AS `entry_text`,' +
    '`inventory`.`text` AS `inventory_text`, `stock`.`lot_number`' +
    'FROM `movement` AS `m`' +
    'JOIN `depot` AS `ex` ON `ex`.`uuid` = `m`.`depot_exit`' +
    'JOIN `depot` AS `en` ON `en`.`uuid` = `m`.`depot_entry`' +
    'JOIN `stock` ON `stock`.`tracking_number` = `m`.`tracking_number`' +
    'JOIN `inventory` ON `inventory`.`uuid` = `stock`.`inventory_uuid`' +
    'WHERE `m`.`date` >= \'' + params.datef + '\' AND `m`.`date` <= \'' + params.datet + '\' ';

  if(params.depot_from !== '*' && params.depot_to !== '*' ){
    requette += ' AND `m`.`depot_exit` = \'' + params.depot_from + '\' AND `m`.`depot_entry` = \'' + params.depot_to + '\'';
  }

  if(params.depot_from === '*' && params.depot_to !== '*' ){
    requette += ' AND `m`.`depot_entry` = \'' + params.depot_to + '\'';
  }

  if(params.depot_from !== '*' && params.depot_to === '*' ){
    requette += ' AND `m`.`depot_exit` = \'' + params.depot_from + '\'';
  }

  requette += ' GROUP BY `m`.`document_id`';

  return db.exec(requette);
}


// Calculates the monthly balance based of period totals
function balanceMensuelle(params) {
  var sql, hasClasse,
      query = querystring.parse(params),
      data = {};

  hasClasse = (query.classe !== '*');

  // gets the amount up to the current period
  sql =
    'SELECT a.number, a.id, a.label, a.type_id, a.is_charge, a.is_asset, SUM(pt.credit) AS credit, SUM(pt.debit) AS debit ' +
    'FROM period_total AS pt JOIN account AS a ON pt.account_id = a.id ' +
    'JOIN period AS p ON pt.period_id = p.id ' +
    'WHERE p.period_stop <= DATE(?) AND pt.enterprise_id = ? ' +
     (hasClasse ? 'AND a.classe = ? ' : '') +
    'GROUP BY a.id;';

  return db.exec(sql, [query.date, query.enterpriseId, query.classe])
  .then(function (rows) {
    data.beginning = rows;

    sql =
      'SELECT a.number, a.label, a.id, a.type_id, a.is_charge, a.is_asset, SUM(pt.credit) AS credit, SUM(pt.debit) AS debit ' +
      'FROM period_total AS pt JOIN account AS a ON pt.account_id = a.id ' +
      'JOIN period AS p ON pt.period_id = p.id ' +
      'WHERE DATE(?) BETWEEN p.period_start AND p.period_stop AND pt.enterprise_id = ? ' +
       (hasClasse ? 'AND a.classe = ? ' : '') +
      'GROUP BY a.id;';

    return db.exec(sql, [query.date, query.enterpriseId, query.classe]);
  })
  .then(function (rows) {
    data.middle = rows;
    return data;
  });
}

function purchase_order() {
  var sql;

  sql =
    'SELECT `purchase`.`uuid`, `purchase`.`reference`, `purchase`.`is_direct`, `purchase`.`project_id`, ' +
    '`purchase`.`purchase_date`, `purchase`.`closed`, `purchase`.`paid` ' +
    'FROM `purchase` ' +
    'WHERE ((`purchase`.`closed` = 0 AND `purchase`.`is_direct` = 0 AND `purchase`.`paid` = 1) OR ' +
    '(`purchase`.`closed` = 0 AND `purchase`.`is_direct` = 1 AND `purchase`.`is_authorized` = 1 )) AND `purchase`.`is_integration` IS null ' +
    'ORDER BY `purchase`.`purchase_date` DESC ';

  return db.exec(sql);
}

function purchaseOrdeRecords(params) {
  var p = querystring.parse(params);

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end)),
      _id = p.id,
      _transaction = sanitize.escape(p.transaction);

  var sql =
    ' SELECT DISTINCT `purchase`.`uuid`, `purchase`.`cost`, `purchase`.`currency_id`, `purchase`.`purchase_date`, `purchase`.`is_direct`, ' +
    '`purchase`.`reference`, `user`.`first`, `user`.`last`, `employee`.`prenom`, `employee`.`name`, `employee`.`postnom`, ' +
    '`purchase`.`is_direct`, `supplier`.`name` AS `supplier_name`, `u`.`first` AS `confirmed_first`, `u`.`last` AS `confirmed_last`, ' +
    '`posting_journal`.`trans_id` AS `journal_trans_id`, `general_ledger`.`trans_id` AS `ledger_trans_id` ' +
    'FROM `purchase` ' +
    'JOIN `user` ON `user`.`id` = `purchase`.`emitter_id` ' +
    'JOIN `user` AS u ON `u`.`id` = `purchase`.`confirmed_by` ' +
    'JOIN `supplier` ON `supplier`.`creditor_uuid` = `purchase`.`creditor_uuid` ' +
    'LEFT JOIN `employee` ON `employee`.`id` = `purchase`.`receiver_id` ' +
    'LEFT JOIN `posting_journal` ON `posting_journal`.`inv_po_id` = `purchase`.`uuid` ' +
    'LEFT JOIN `general_ledger` ON `general_ledger`.`inv_po_id` = `purchase`.`uuid`' +
    'WHERE `purchase`.`is_direct` IN (' + _id + ') AND DATE(`purchase`.`purchase_date`) BETWEEN DATE(' + _start + ') AND DATE(' + _end + ') ' +
    'AND (`posting_journal`.`origin_id` = ' + _transaction + ' OR `general_ledger`.`origin_id` = ' + _transaction + ') ' +
    'AND `purchase`.`confirmed` = 1 ORDER BY `purchase`.`purchase_date` DESC ;';

  return db.exec(sql);
}


function donation_confirmationRecords(params) {
  var p = querystring.parse(params);

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end));

  var sql =
    'SELECT DISTINCT `donations`.`uuid`, `donations`.`date`, `user`.`first`, `user`.`last`, `employee`.`prenom`, ' +
    '`employee`.`name`, `employee`.`postnom`, `donor`.`name` AS `donor_name`, ' +
    '`posting_journal`.`trans_id` AS `journal_trans_id`, `general_ledger`.`trans_id` AS `ledger_trans_id` ' +
    'FROM `donations` ' +
    'JOIN `user` ON `user`.`id` = `donations`.`confirmed_by` ' +
    'JOIN `donor` ON `donor`.`id` = `donations`.`donor_id` ' +
    'JOIN `employee` ON `employee`.`id` = `donations`.`employee_id` ' +
    'LEFT JOIN `posting_journal` ON `posting_journal`.`inv_po_id` = `donations`.`uuid` ' +
    'LEFT JOIN `general_ledger` ON `general_ledger`.`inv_po_id` = `donations`.`uuid`' +
    'WHERE DATE(`donations`.`date`) BETWEEN DATE(' + _start + ') AND DATE(' + _end + ') ' +
    'AND `donations`.`is_confirmed` = 1 ORDER BY `donations`.`date` DESC ;';

  return db.exec(sql);
}

function integration_stock(params) {
  var p = querystring.parse(params);

  var _start = sanitize.escape(new Date(p.start)),
      _end =  sanitize.escape(new Date(p.end)),
      _depot = sanitize.escape(p.depot);

  var sql =
    'SELECT DISTINCT purchase.uuid, purchase.cost, purchase.is_integration, purchase.currency_id, ' +
    'purchase.purchase_date, purchase.is_direct, purchase.reference, purchase.is_direct, ' +
    'posting_journal.inv_po_id, posting_journal.trans_id, ' +
    'user.first, user.last, u.first AS confirmed_first, u.last AS confirmed_last, movement.depot_entry, movement.document_id, depot.text ' +
    'FROM purchase ' +
    'JOIN posting_journal ON posting_journal.inv_po_id = purchase.uuid ' +
    'JOIN user ON user.id = purchase.emitter_id ' +
    'JOIN user AS u ON u.id = purchase.confirmed_by ' +
    'JOIN stock ON stock.purchase_order_uuid = purchase.uuid ' +
    'JOIN movement ON movement.tracking_number = stock.tracking_number ' +
    'JOIN depot ON depot.uuid = movement.depot_entry ' +
    'WHERE DATE(purchase.purchase_date) BETWEEN DATE(' + _start + ') AND DATE(' + _end + ') ' +
    'AND (purchase.is_return = 0 OR purchase.is_return IS NULL) AND purchase.is_integration = 1 AND purchase.confirmed = 1 AND movement.depot_entry = ' + _depot + ' ' +
    'UNION ' +
    'SELECT DISTINCT purchase.uuid, purchase.cost, purchase.is_integration, purchase.currency_id, ' +
    'purchase.purchase_date, purchase.is_direct, purchase.reference, purchase.is_direct, ' +
    'general_ledger.inv_po_id, general_ledger.trans_id, ' +
    'user.first, user.last, u.first AS confirmed_first, u.last AS confirmed_last, movement.depot_entry, movement.document_id, depot.text ' +
    'FROM purchase ' +
    'JOIN general_ledger ON general_ledger.inv_po_id = purchase.uuid ' +
    'JOIN user ON user.id = purchase.emitter_id ' +
    'JOIN user AS u ON u.id = purchase.confirmed_by ' +
    'JOIN stock ON stock.purchase_order_uuid = purchase.uuid ' +
    'JOIN movement ON movement.tracking_number = stock.tracking_number ' +
    'JOIN depot ON depot.uuid = movement.depot_entry ' +
    'WHERE DATE(purchase.purchase_date) BETWEEN DATE(' + _start + ') AND DATE(' + _end + ') ' +
    'AND (purchase.is_return = 0 OR purchase.is_return IS NULL) AND purchase.is_integration = 1 AND purchase.confirmed = 1 AND movement.depot_entry = ' + _depot + ' ';

  return db.exec(sql);
}

function stock_store(params) {
  var deferred = q.defer();
  params = JSON.parse(params);

  var requestSql =
    'SELECT stock.inventory_uuid, stock.tracking_number, ' +
    'stock.lot_number, stock.expiration_date, SUM(if (movement.depot_entry='+sanitize.escape(params.depotId)+
    ', movement.quantity, (movement.quantity*-1))) as current, SUM(if (movement.depot_entry=' + sanitize.escape(params.depotId) +
    ', movement.quantity, 0)) AS initial, inventory.text FROM stock JOIN inventory JOIN movement ON stock.inventory_uuid = inventory.uuid AND '+
    'stock.tracking_number = movement.tracking_number WHERE (movement.depot_entry=' + sanitize.escape(params.depotId) +
    'OR movement.depot_exit=' + sanitize.escape(params.depotId) + ')  GROUP BY movement.tracking_number';

  return db.exec(requestSql);
}

function stockComplete(params) {
  params = querystring.parse(params);

  var requestSql,
    tracking_number = sanitize.escape(params.tracking_number),
    depot_uuid = sanitize.escape(params.depot_uuid);

  requestSql =
    'SELECT SUM(cons.consumed ) AS consumed ' +
    'FROM ( ' +
      'SELECT SUM(consumption.quantity) AS consumed ' +
      'FROM stock ' +
      'LEFT JOIN consumption ON stock.tracking_number = consumption.tracking_number ' +
      'WHERE stock.tracking_number = ' + tracking_number + ' AND consumption.canceled <> 1 '+
      ' AND consumption.depot_uuid = ' + depot_uuid + ' '+
    'UNION '+
      'SELECT ((SUM(consumption.quantity)) * (-1)) AS consumed ' +
      'FROM stock ' +
      'LEFT JOIN consumption ON stock.tracking_number = consumption.tracking_number ' +
      'WHERE stock.tracking_number = ' + tracking_number + ' AND consumption.canceled = 1 ' +
      'AND consumption.depot_uuid = ' + depot_uuid + '  ) AS cons;';

  return db.exec(requestSql);
}

// TODO -- this accept two dates
function operatingAccount(params) {
  params = querystring.parse(params);
  var fiscal_id = sanitize.escape(params.fiscal_id),
      sql;

  sql =
    'SELECT period_total.period_id, account.number, account.classe, account.label, period_total.credit, period_total.debit ' +
    'FROM period_total ' +
    'JOIN account ON account.id = period_total.account_id ' +
    'JOIN account_type ON account_type.id = account.type_id ' +
    'WHERE period_total.period_id = ' + params.period_id + ' ' +
    'AND period_total.credit <> period_total.debit ' +
    'AND account_type.type = \'income/expense\' ' +
    'ORDER BY account.number ASC';

  if (params.period_id === 'all') {
    sql =
      'SELECT period_total.period_id, account.number, account.classe, account.label, SUM(period_total.credit) AS \'credit\', ' +
        'SUM(period_total.debit) AS \'debit\' ' +
      'FROM period_total ' +
      'JOIN account ON account.id = period_total.account_id ' +
      'JOIN account_type ON account_type.id = account.type_id ' +
      'WHERE period_total.fiscal_year_id = ' + fiscal_id + ' ' +
      'AND account_type.type = \'income/expense\' ' +
      'GROUP BY account.number ' +
      'HAVING credit <> debit ' +
      'ORDER BY account.number ASC ';
  }

  return db.exec(sql);
}

function patientGroups(params) {
  params = querystring.parse(params);

  var uuid = params.uuid;
  var body = {};

  return fetchPatientGroupAndPriceList(uuid)
  .then(function (data) {
    body = data;
    return fetchMembers(uuid);
  })
  .then(function (data) {
    body.group.members = data.pop().members;
    return q(body);
  });
}

function fetchMembers(uuid) {
  // fetch the number of members in the current patient group.
  var sql =
    'SELECT COUNT(*) AS members FROM assignation_patient ' +
    'WHERE assignation_patient.patient_group_uuid = ?';

  return db.exec(sql, [uuid]);
}

function fetchPatientGroupAndPriceList(groupUuid) {
  // load the selected patient group
  var sql, result, data;
  sql =
    'SELECT pg.uuid, pg.created, pg.price_list_uuid, pg.name, pg.note, pl.title, ' +
      'pl.description, pli.is_discount, pli.description AS itemDescription, ' +
      'pli.value, pli.is_global ' +
    'FROM patient_group AS pg JOIN price_list AS pl JOIN price_list_item AS pli ' +
      'ON pg.price_list_uuid = pl.uuid AND ' +
      'pli.price_list_uuid = pl.uuid ' +
    'WHERE pg.uuid = ?';

  // result init null
  // usefull for catching errors
  result = {
    uuid            : null,
    note            : null,
    name            : null,
    created         : null,
    price_list_uuid : null,
    title           : null,
    description     : null
  };

  return db.exec(sql, [groupUuid])
  .then(function (rows) {
    result = rows.length > 0 ? rows[0] : result ;  // first row or null object

    // format the data for easy client-side consumption
    data = {};

    data.group = {
      uuid        : result.uuid,
      description : result.note,
      name        : result.name,
      created     : result.created
    };

    data.pricelist = {
      uuid        : result.price_list_uuid,
      title       : result.title,
      description : result.description
    };

    // item details
    data.priceListDetails = rows.map(function (row)  {
      return {
        description : row.itemDescription,
        isDiscount  : row.is_discount,
        isGlobal    : row.is_global,
        value       : row.value
      };
    });

    return q(data);
  });
}

function loadPriceListItems(listUuid) {
  // load the exact items with their associated prices
  var sql, data;

  sql =
    'SELECT pli.uuid, pli.description, pli.is_discount, pli.is_global, ' +
      'pli.value, i.code, i.text, i.price, ig.name ' +
    'FROM price_list_item AS pli JOIN inventory AS i JOIN inventory_group AS ig ' +
      'ON pli.inventory_uuid = i.uuid AND ig.uuid = i.group_uuid ' +
    'WHERE pli.price_list_uuid = ?';

  return db.exec(sql, [listUuid])
  .then(function (rows) {
    data = {};

  });
}

function generate(request, params, done) {
  /*summary
  *   Route request for reports, if no report matches given request, return null
  */
  var route = {
    'finance'               : finance,
    'debtorAging'          : debtorAging,
    'saleRecords'           : saleRecords,
    'distributionPatients'  : distributionPatients,
    'distributionServices'  : distributionServices,
    'patients'              : patientRecords,
    'patients_new_visit'    : patientNewVisit,
    'patients_old_visit'    : patientOldVisit,
    'payments'              : paymentRecords,
    'patientStanding'       : patientStanding,
    'employeePaiement'      : employeePaiement,
    'employeeStanding'      : employeeStanding,
    'employeeStandingV2'    : employeeStandingV2,
    'accountStatement'      : accountStatement,
    'allTransactions'       : allTransactions,
    'prices'                : priceReport,
    'stock_location'        : stockLocation,
    'stock_count'           : stockCount,
    'cotisation_payment'    : cotisation_payment,
    'taxes_payment'         : taxes_payment,
    'transactions'          : transactionsByAccount,
    'income_report'         : incomeReport,
    'expense_report'        : expenseReport,
    'patient_group'         : patientGroups,
    'balance_mensuelle'     : balanceMensuelle,
    'cashAuxillaryRecords'  : cashAuxillaryRecords,
    'purchase_order'        : purchase_order,
    'purchase_records'      : purchaseOrdeRecords,
    'donation_confirmation' : donation_confirmationRecords,
    'integration_stock'     : integration_stock,
    'stock_movement'        : stock_movement,
    'stockStore'            : stock_store,
    'stockComplete'         : stockComplete,
    'operatingAccount'      : operatingAccount
  };

  route[request](params)
  .then(function (report) {
    done(report);
  })
  .catch(function (err) {
    done(null, err);
  })
  .done();
}

var db        = require('./../../lib/db');
var sanitize  = require('./../../lib/sanitize');
var synthetic = require('./../finance/synthetic');

/** 
 * HTTP Controllers
 *
 * listServices : provide a list of all services 
 */
exports.listServices = function (req, res, next) {
  var sql =
    'SELECT `service`.`id`, `service`.`name` AS `service`, `service`.`cost_center_id`, `service`.`profit_center_id`, `cost_center`.`text` AS `cost_center`, `profit_center`.`text` AS `profit_center` '+
    'FROM `service` JOIN `cost_center` JOIN `profit_center` ON `service`.`cost_center_id`=`cost_center`.`id` AND `service`.`profit_center_id`=`profit_center`.`id` ';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.availableCostCenters = function (req, res, next) {
  var sql =
    'SELECT `cost_center`.`text`, `cost_center`.`id`, `cost_center`.`project_id`, `service`.`name` '+
    'FROM `cost_center` LEFT JOIN `service` ON `service`.`cost_center_id`=`cost_center`.`id`';

  function process(ccs) {
    var costCenters = ccs.filter(function(item) {
      return !item.name;
    });
    return costCenters;
  }
  db.exec(sql)
  .then(function (result) {
    res.send(process(result));
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.availableProfitCenters = function (req, res, next) {
  var sql =
    'SELECT `profit_center`.`text`, `profit_center`.`id`, `profit_center`.`project_id`, `service`.`name` '+
    'FROM `profit_center` LEFT JOIN `service` ON `service`.`profit_center_id`=`profit_center`.`id`';

  function process(pcs) {
    var profitCenters = pcs.filter(function(item) {
      return !item.name;
    });
    return profitCenters;
  }
  db.exec(sql)
  .then(function (result) {
    res.send(process(result));
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.costCenterCost = function (req, res, next) {
  var sql =
    'SELECT `account`.`id`, `account`.`number`, `account`.`label` FROM `account` '+
    'WHERE `account`.`cc_id` = ' + sanitize.escape(req.params.cc_id) +
    ' AND `account`.`type_id` <> 3';

  function process(accounts) {
    if(accounts.length === 0) {return {cost : 0};}
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('6') === 0;
    });

    var cost = availablechargeAccounts.reduce(function (x, y) {
      return x + (y.debit - y.credit);

    }, 0);

    return {cost : cost};
  }

  db.exec(sql)
  .then(function (ans) {
    synthetic('ccc', req.params.id_project, {cc_id : req.params.cc_id, accounts : ans}, function (err, data) {
      if (err) { return next(err); }
      res.send(process(data));
    });
  })
  .catch(next)
  .done();
};

exports.profitCenterCost = function (req, res, next) {
  var sql =
    'SELECT `account`.`id`, `account`.`number`, `account`.`label` FROM `account` '+
    'WHERE `account`.`pc_id`=' + sanitize.escape(req.params.pc_id) +
    ' AND `account`.`type_id` <> 3';

  function process(accounts) {
    if(accounts.length === 0) {return {profit : 0};}
    var availableprofitAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('7') === 0;
    });

    var profit = availableprofitAccounts.reduce(function (x, y) {
      return x + (y.credit - y.debit);

    }, 0);

    return {profit : profit};
  }

  db.exec(sql)
  .then(function (ans) {
    synthetic('pcv', req.params.id_project, {pc_id : req.params.pc_id, accounts : ans}, function (err, data) {
      if (err) { return next(err); }
      res.send(process(data));
    });
  })
  .catch(next)
  .done();
};

exports.costCenterAccount = function (req, res, next) {
  var sql =
    'SELECT account.id, account.number, account.label ' +
    'FROM account JOIN cost_center ' +
    'ON account.cc_id = cost_center.id '+
    'WHERE account.enterprise_id = ' + sanitize.escape(req.params.id_enterprise) + ' ' +
      'AND account.parent <> 0 ' +
      'AND account.is_ohada = 1 ' +
      'AND account.cc_id = ' + sanitize.escape(req.params.cost_center_id) + ';';

  function process(accounts) {
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('6') === 0;
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

exports.profitCenterAccount = function (req, res, next) {
  var sql =
    'SELECT account.id, account.number, account.label ' +
    'FROM account JOIN profit_center ' +
    'ON account.pc_id = profit_center.id '+
    'WHERE account.enterprise_id = ' + sanitize.escape(req.params.id_enterprise) + ' ' +
      'AND account.parent <> 0 ' +
      'AND account.is_ohada = 1 ' +
      'AND account.pc_id = ' + sanitize.escape(req.params.profit_center_id) + ';';

  function process(accounts) {
    var availableprofitAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('7') === 0;
    });
    return availableprofitAccounts;
  }

  db.exec(sql)
  .then(function (rows) {
    res.send(process(rows));
  })
  .catch(next)
  .done();
};

exports.auxCenterAccount = function (req, res, next) {
  var sql =
    'SELECT account.id, account.number, account.label ' +
    'FROM account JOIN auxiliairy_center ' +
    'ON account.auxiliairy_center_id = auxiliairy_center.id ' +
    'WHERE account.enterprise_id = ' + sanitize.escape(req.params.id_enterprise) + ' ' +
      'AND account.parent <> 0 ' +
      'AND account.auxiliairy_center_id = ' + sanitize.escape(req.params.auxiliairy_center_id) + ';';

  function process(accounts) {
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('6') === 0;
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

exports.removeFromCostCenter = function (req, res, next) {
  var tabs = JSON.parse(req.params.tab);

  tabs = tabs.map(function (item) {
    return item.id;
  });

  var sql =
    'UPDATE `account` SET `account`.`cc_id` = NULL WHERE `account`.`id` IN ('+tabs.join(',')+')';

  db.exec(sql)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(next)
  .done();
};

exports.removeFromProfitCenter = function (req, res, next) {
  var tabs = JSON.parse(req.params.tab);
  tabs = tabs.map(function (item) {
    return item.id;
  });

  var sql =
    'UPDATE `account` SET `account`.`pc_id` = NULL WHERE `account`.`id` IN (' + tabs.join(',') + ')';

  db.exec(sql)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(next)
  .done();
};

/* Ambigious service categorisation */
exports.costByPeriod = function (req, res, next) {
  var sql =
    'SELECT `account`.`id`, `account`.`number`, `account`.`label` FROM `account` '+
    'WHERE `account`.`cc_id`=' + sanitize.escape(req.params.cc_id) +
    ' AND `account`.`type_id` <> 3';

  function process(accounts) {
    if(accounts.length === 0) {return {cost : 0};}
    var availablechargeAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('6') === 0;
    });


    var cost = availablechargeAccounts.reduce(function (x, y) {
      return x + (y.debit - y.credit);

    }, 0);

    return {cost : cost};
  }

  db.exec(sql)
  .then(function (ans) {
    synthetic('ccc_periodic', req.params.id_project, {cc_id : req.params.cc_id, start : req.params.start, end : req.params.end, accounts : ans}, function (err, data) {
      if (err) { return next(err); }
      res.send(process(data));
    });
  })
  .catch(next)
  .done();
};

exports.profitByPeriod = function (req, res, next) {
  var sql =
    'SELECT `account`.`id`, `account`.`number`, `account`.`label` FROM `account` '+
    'WHERE `account`.`pc_id`=' + sanitize.escape(req.params.pc_id) +
    ' AND `account`.`type_id` <> 3';

  function process(accounts) {
    if(accounts.length === 0) {return {profit : 0};}
    var availableprofitAccounts = accounts.filter(function(item) {
      return item.number.toString().indexOf('7') === 0;
    });

    var profit = availableprofitAccounts.reduce(function (x, y) {
      return x + (y.credit - y.debit);

    }, 0);

    return {profit : profit};
  }

  db.exec(sql)
  .then(function (ans) {
    synthetic('pcv_periodic', req.params.id_project, {pc_id : req.params.pc_id, start : req.params.start, end : req.params.end, accounts : ans}, function (err, data) {
      if (err) { return next(err); }
      res.send(process(data));
    });
  })
  .catch(next)
  .done();
};

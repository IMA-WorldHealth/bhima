var db        = require('./../../lib/db');

exports.list = function (req, res, next) {
  'use strict';

  var sql = 'SELECT `subsidy`.`uuid`, `subsidy`.`text`, `subsidy`.`value`, `subsidy`.`is_percent`, `subsidy`.`debitor_group_uuid`, ' +
    '`debitor_group`.`name` FROM `subsidy` JOIN `debitor_group` ON `subsidy`.`debitor_group_uuid`=`debitor_group`.`uuid`';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};



var q = require('q');
var db = require('./../../lib/db');
var uuid = require('./../../lib/guid');
var journal = require('./journal');


/**
* Create a Purchase Order in the database
*
**/

function create (req, res, next) {
  'use strict';

  var purchase = req.body;

  purchase.uuid = purchase.uuid || uuid();

  var sql = 'INSERT INTO purchase SET ?';


  db.exec(sql, [purchase])
  .then(function (result) {
    res.status(201).json({ uuid : purchase.uuid });
  })
  .catch(next)
  .done();
}


/**
* GET /projects/
*
* Returns the details of a single project
*/
function list (req, res, next) {
  'use strict';

  var sql =
    'SELECT purchase.uuid, purchase.reference, purchase.cost, purchase.discount, purchase.purchase_date, purchase.paid, ' +
    'creditor.text, employee.name, employee.prenom, user.first, user.last ' +
    'FROM purchase ' +
    'JOIN creditor ON creditor.uuid = purchase.creditor_uuid ' +
    'JOIN employee ON employee.id = purchase.purchaser_id ' +
    'JOIN user ON user.id = purchase.emitter_id; ';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /purchase/: uuid
*
* Returns the details of a single purchase order
*/
function detail (req, res, next) {
  'use strict';

  var purchaseUuid = req.params.uuid;
  var sql =
    'SELECT purchase.uuid, purchase.reference, purchase.cost, purchase.discount, purchase.purchase_date, purchase.paid, ' +
    'creditor.text, employee.name, employee.prenom, user.first, user.last ' +
    'FROM purchase ' +
    'JOIN creditor ON creditor.uuid = purchase.creditor_uuid ' +
    'JOIN employee ON employee.id = purchase.purchaser_id ' +
    'JOIN user ON user.id = purchase.emitter_id ' +
    'WHERE purchase.uuid = ?';

  db.exec(sql, [purchaseUuid])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


// create a new purchase order
exports.create = create;

//Read all purchase order
exports.list = list;

// Read a specific purchase order
exports.detail = detail;
/**
* Enterprises Controller
*
* This controller is responsible for creating and updating Enterprises.  Every
*/
var db = require('../../lib/db');


exports.list = function list(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, name, abbr, email, po_box, phone, location_id, logo, currency_id FROM enterprise';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// get Enterprises
function helperGetEnterprise(id, codes) {
  'use strict';

  var sql,
      cashbox;

  sql =
    'SELECT id, name, abbr, email, po_box, phone, location_id, logo, currency_id FROM enterprise ' +
    'WHERE id = ?;';

  return db.exec(sql, [id])
  .then(function (rows) {

    if (!rows.length) {
      throw codes.NOT_FOUND;
    }

    cashbox = rows[0];

    // query the currencies supported by this cashbox
    sql =
      'SELECT currency_id, account_id, gain_exchange_account_id, ' +
        'loss_exchange_account_id, virement_account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_id = ?;';

    return db.exec(sql, [cashbox.id]);
  })
  .then(function (rows) {

    // assign the currencies to the cashbox
    cashbox.currencies = rows;

    return cashbox;
  });
}

/**
* GET /cashboxes/:id
*
* Returns the details of a specific cashbox, including the supported currencies
* and their accounts.
*/
/*exports.details = function details(req, res, next) {
  'use strict';

  helperGetEnterprise(req.params.id, req.codes)
  .then(function (cashbox) {
    res.status(200).json(cashbox);
  })
  .catch(next)
  .done();
};*/

// POST /cashboxes
exports.create = function create(req, res, next) {
  'use strict';

  var enterprise = req.body.enterprises,
    writeEnterpriseQuery;
  
  writeEnterpriseQuery = 'INSERT INTO enterprise (name, abbr, phone, email, location_id, logo, currency_id, po_box) VALUES (?);';

  db.exec(writeEnterpriseQuery, [[enterprise.name, enterprise.abbr, enterprise.phone, enterprise.email,
    enterprise.location_id, enterprise.logo, enterprise.currency_id, enterprise.po_box]])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /cashboxes/:id
exports.update = function update(req, res, next) {
  'use strict';

  var sql;

  sql = 'UPDATE enterprise SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};


// DELETE /cashboxes/:id
exports.delete = function del(req, res, next) {
  'use strict';

  var sql;

  sql = 'DELETE FROM cash_box WHERE id = ?';

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).send();
  })
  .catch(next)
  .done();
};

// API for cashbox currencies
exports.currencies = {};

// GET /cashboxes/:id/currencies
exports.currencies.list = function listCurrencies(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, currency_id, loss_exchange_account_id, account_id, ' +
      'gain_exchange_account_id, virement_account_id ' +
    'FROM cash_box_account_currency WHERE cash_box_id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

// GET /cashboxes/:id/currencies/:currencyId
exports.currencies.details = function detailCurrencies(req, res, next) {
  'use strict';

  var sql;

  sql =
    'SELECT id, loss_exchange_account_id, account_id, ' +
      'gain_exchange_account_id, virement_account_id ' +
    'FROM cash_box_account_currency ' +
    'WHERE cash_box_id = ? AND currency_id = ?;';

  db.exec(sql, [req.params.id, req.params.currencyId])
  .then(function (rows) {
    if (rows.length === 0) {
      throw req.codes.NOT_FOUND;
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

// POST /cashboxes/:id/currencies
exports.currencies.create = function createCurrency(req, res, next) {
  'use strict';

  var sql;
  var data = req.body;
  data.cashbox_id = req.params.id;

  sql =
    'INSERT INTO cash_box_account_currency (' +
      'currency_id, account_id, virement_account_id, gain_exchange_account_id, ' +
      'loss_exchange_account_id, cash_box_id ' +
    ') VALUES (?);';

  db.exec(sql, [[
    data.currency_id, data.account_id, data.virement_account_id,
    data.gain_exchange_account_id, data.loss_exchange_account_id,
    data.cashbox_id
  ]]).then(function (row) {
    res.status(201).json({ id: row.insertId });
  })
  .catch(next)
  .done();
};

// PUT /cashboxes/:id/currencies/:currencyId
exports.currencies.update = function updateCurrency(req, res, next) {
  'use strict';

  var sql;
  var data = req.body;

  sql =
    'UPDATE cash_box_account_currency SET ? ' +
    'WHERE cash_box_id = ? AND currency_id = ?;';

  db.exec(sql, [data, req.params.id, req.params.currencyId])
  .then(function (result) {

    // send the changed object to the client
    sql =
      'SELECT id, loss_exchange_account_id, account_id, ' +
        'gain_exchange_account_id, virement_account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_id = ? AND currency_id = ?;';

    return db.exec(sql, [req.params.id, req.params.currencyId ]);
  })
  .then(function (rows) {

    // in case an unknown id is sent to the server
    if (!rows.length) {
      return res.status(200).json({});
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};

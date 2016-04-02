/**
* @module finance/discounts
*
* @desc The discounts API implements CRUD on the `discount` table in the
* database.
*
* @requires lib/db
*/

var db = require('../../lib/db');

/**
 * @desc Looks up a discount in the database by its id.  Throws a prmoise error
 * if the record does not exist, otherwise returns the record.
 *
 * @param {number} id
 * @param {object} codes
 * @returns {Promise} record
 */
function lookupDiscount(id, codes) {
  'use strict';

  var sql =
    'SELECT d.id, d.label, d.description, d.inventory_uuid, ' +
      'd.account_id, d.value, a.number, i.text as inventoryLabel ' +
    'FROM discount AS d JOIN inventory AS i ON d.inventory_uuid = i.uuid ' +
    'JOIN account AS a ON d.account_id = a.id ' +
    'WHERE d.id = ?;';

  return db.exec(sql, [ id ])
  .then(function (rows) {

    // if no matches in the database, throw a 404
    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    // return a single record
    return rows[0];
  });
}

/**
 * GET /discounts/:id
 *
 * @desc Queries the database to a discount matching the param :id.  Expected
 * to respond with either HTTP status 404 or 200.
 */
exports.detail = function detail(req, res, next) {
  'use strict';

  lookupDiscount(req.params.id, req.codes)
  .then(function (discount) {
    res.status(200).json(discount);
  })
  .catch(next)
  .done();
};

/**
 * GET /discounts
 *
 * @desc Queries the database to list all discounts recorded in the database.
 * Returns HTTP status code 200 with an array containing zero or more records.
 */
exports.list = function list(req, res, next) {
  'use strict';

  var sql =
    'SELECT d.id, d.label, d.value FROM discount AS d;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
};

/**
 * POST /discounts
 *
 * @desc Inserts a single discount record into the database.  If the record
 * is properly inserted, it returns a 201 CREATED status and the generated id.
 */
exports.create = function create(req, res, next) {
  'use strict';

  // expects the proposed record to be namespaced by "discount"
  var data = req.body.discount;

  if (data.value < 0) {
    return next(new req.codes.ERR_NEGATIVE_VALUES());
  }

  var sql =
    'INSERT INTO discount ' +
      '(label, description, inventory_uuid, account_id, value) ' +
    'VALUES (?, ?, ?, ?, ?);';

  // attempt to insert the record
  db.exec(sql, [
    data.label, data.description, data.inventory_uuid, data.account_id, data.value
  ])
  .then(function (result) {
    res.status(201).json({ id : result.insertId });
  })
  .catch(next)
  .done();
};

/**
 * PUT /discounts/:id
 *
 * @desc Updates a single discount record in the database.  If the record does
 * not exist, this endpoint returns a 404 error.  If the record does exist and
 * is sucessfully updated, we return the fully changed record (status 200).
 */
exports.update = function update(req, res, next) {
  'use strict';

  // no namespace necessary for updates -- allows middleware to catch empty
  // req.body's
  var data = req.body;
  var id = req.params.id;

  // remove the id if it exists (prevent attacks on data integrity)
  delete data.id;

  if (data.value && data.value < 0) {
    return res.status(400).json({
      code : 'ERR_NEGATIVE_VALUES',
      reason : 'You cannot insert a negative value into this table.'
    });
  }

  var sql =
    'UPDATE discount SET ? WHERE id = ?;';

  // ensure the record exists by looking it up first
  lookupDiscount(id, req.codes)
  .then(function (record) {

    // run the update query
    return db.exec(sql, [ data, id ]);
  }).then(function (rows) {

    // read the changes from the database
    return lookupDiscount(id, req.codes);
  }).then(function (discount) {

    // return the fully changed database record
    res.status(200).json(discount);
  })
  .catch(next)
  .done();
};

/**
 * DELETE /discounts/:id
 *
 * @desc Deletes a discount record in the database matching the param id.  If
 * the record does not exist, returns a 404 error.  Otherwise, it will return
 * a 204 NO CONTENT for a successfully deleted record.
 */
exports.delete = function del(req, res, next) {
  'use strict';

  var id = req.params.id;
  var sql =
    'DELETE FROM discount WHERE id = ?;';

  // make sure the record actually exists
  lookupDiscount(id, req.codes)
  .then(function (discount) {

    // run the delete query
    return db.exec(sql, [ id ]);
  }).then(function () {

    // return a 204 NOT CONTENT success message
    res.status(204).send();
  })
  .catch(next)
  .done();
};

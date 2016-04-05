/**
* Debtors Controller
*
* This module is responsible for handling crud operations on the debtor
* table.  Currently, this is limited to update (debtors are created in
* association with other entities, such as patients).
*
* There are also some specialized queries such as looking up imbalanced
* invoices, and looking up the balance on a debtor's account.
*
*
* @module controllers/finance/debtors
*
* @requires lib/db
* @requires lib/errors/NotFound
* @requires lib/errors/BadRequest
*
* @todo Patients currently responsible for setting debtor (one small line) - should this be delegated here?
*/
var q = require('q');
var db          = require('../../../lib/db');
var uuid        = require('node-uuid');
var NotFound    = require('../../../lib/errors/NotFound');
var BadRequest  = require('../../../lib/errors/BadRequest');

exports.update = update;
exports.invoices = invoices;
exports.balance = function() { /** @todo - noop */ };

/**
 * Updates a debtor's details (particularly group_uuid)
 */
function update(req, res, next) {
  var sql =
    'UPDATE debitor SET ? WHERE uuid = ?';

  // delete the uuid if it exists
  delete req.body.uuid;

  db.exec(sql, [req.body, req.params.uuid])
  .then(function () {
    return lookupDebtor(req.params.uuid);
  })
  .then(function (debtor) {
    res.status(200).json(debtor);
  })
  .catch(next)
  .done();
}

/**
 * Find a debtor by their uuid.
 *
 * @param {String} uid - the uuid of the debtor
 * @returns {Promise} promise resolving to the debtor object
 */
function lookupDebtor(uid) {
  var sql =
    'SELECT uuid, group_uuid, text ' +
    'FROM debitor ' +
    'WHERE uuid = ?';

  return db.exec(sql, [uid])
  .then(function (rows) {
    if (!rows.length) {
      throw new NotFound('Could not find a debtor with uuid ' + uid);
    }
    return rows[0];
  });
}


/**
 * This function returns all invoices billed to a particular debtor.
 *
 * The algorithm works like this:
 *  1) Look up all invoices billed to that debtor
 *  2) Look up those invoices in the combined ledger, as well as payments
 *    against them.  These are summed into debits and credits.
 *
 * The database will optionally filter invoices based on whether they are
 * balanced (paid off) or not.
 *
 * NOTE - this function is not suitable for reporting, and should only be used
 * by modules that need up-to-the minute debtor status.  There is no control
 * over the dataset queried only the debtor
 *
 * @method invoices
 */
function invoices(req, res, next) {
  var uid = req.params.uuid;
  var options = req.query;

  // get the debtor invoice uuids from the sales table
  var sql =
    'SELECT uuid FROM sale WHERE debitor_uuid = ?;';

  db.exec(sql, [uid])
  .then(function (uuids) {

    // if nothing found, return an empty array
    if (!uuids.length) {
      return q.resolve([]);
    }

    // select all invoice and payments against invoices from the combined ledger
    sql =
      `SELECT i.uuid, CONCAT(project.abbr, sale.reference) as reference,
        credit, debit, entity_uuid
      FROM (
        SELECT uuid, SUM(debit) as debit, SUM(credit) as credit, entity_uuid '
        FROM (
          SELECT record_uuid as uuid, debit, credit
          FROM combined_ledger '
          WHERE record_uuid IN (?) AND entity_uuid = ?
        UNION ALL '
          SELECT reference_uuid as uuid, debit, credit
          FROM  combined_ledger
          WHERE reference_uuid IN (?) AND entity_uuid = ?
        ) AS ledger
        GROUP BY entity_uuid
      ) AS i JOIN sale ON i.uuid = sale.uuid
      JOIN project ON sale.project_id = project.id `;

    /**
     * @todo - put in balance
    sql +=
      (options.balanced === '1') ? ' HAVING balance = 0;' :
      (options.balanced === '0') ? ' HAVING balance > 0;' :
      ';';
    */

    return db.exec(sql, [uuids, uid, uuids, uid]);
  })
  .then(function (invoices) {
    res.status(200).send(invoices);
  })
  .catch(next)
  .done();
}

/**
 * This function returns the balance of a debtors account with the hospital.
 *
 * The algorithm works like this:
 *  1) Look up all transaction lines associated with that debtor and sum the
 *  debits and credits.
 *
 * NOTE - this function is not suitable for reporting, and should only be used
 * by modules that need up-to-the minute debtor status.  There is no control
 * over the dataset queried only the debtor
 *
 * @method balance
 */
function balance(req, res, next) {
  var uid = req.params.uuid;
  var options = req.query;

  // make sure the debtor exists
  var sql =
    'SELECT uuid FROM debitor WHERE uuid = ?;';

  db.exec(sql, [uid])
  .then(function (rows) {

    // if the debtor doesn't exist, throw an error
    if (!rows.length) {
      throw new NotFound(
        `Could not find a debtor with uuid ${uid}`
      );
    }

    // select all invoice and payments against invoices from the combined ledger
    sql =
      `SELECT COUNT(*) AS count, SUM(credit - debit) AS balance, entity_uuid
      FROM (
        SELECT record_uuid as uuid, debit, credit
        FROM combined_ledger
        WHERE entity_uuid = ?
      ) AS ledger
      GROUP BY entity_uuid;`;

    return db.exec(sql, [uid, uid]);
  })
  .then(function (invoices) {
    res.status(200).send(invoices);
  })
  .catch(next)
  .done();

}

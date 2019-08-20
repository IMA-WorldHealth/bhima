/**
 * This file contains utility functions for accounts
 */
const db = require('../../../lib/db');
const { NotFound } = require('../../../lib/errors');

/**
 * @method lookupAccount
 *
 * @description
 * Returns the account details matching the id. If there is no matching account,
 * the function throws a NotFound() error.
 *
 * @param {Number} id - the id of the accout to fetch in the database
 * @returns {Promise} - a promise resolving to the account object.
 */
function lookupAccount(id) {
  let sql = `
    SELECT a.id, a.enterprise_id, a.locked, a.created,
      a.reference_id, a.number, a.label, a.parent, a.type_id, at.type,
      at.translation_key
    FROM account AS a JOIN account_type AS at ON a.type_id = at.id `;

  // Added the restriction to prevent the display when downloading the chart
  // of accounts in Excel, CSV or PDF of the hidden accounts

  sql += id ? ' WHERE a.id = ? ORDER BY CAST(a.number AS CHAR(15)) ASC;'
    : ' WHERE a.hidden = 0 ORDER BY CAST(a.number AS CHAR(15)) ASC;';

  return db.exec(sql, id)
    .then(rows => {
      if (rows.length === 0) {
        throw new NotFound(`Could not find account with id ${id}.`);
      }

      return id ? rows[0] : rows;
    });
}

exports.lookupAccount = lookupAccount;

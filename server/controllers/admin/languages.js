/**
 * @overview Languages
 *
 * @description
 * This tiny controller is only to echo the languages supported until a better
 * place is found for the code.
 *
 * @requires db
 */

'use strict';

const db = require('../../lib/db');

exports.list = list;

// GET /languages
function list(req, res, next) {
  let sql = `
    SELECT lang.id, lang.name, lang.key, lang.locale_key AS localeKey
    FROM language AS lang;
  `;

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

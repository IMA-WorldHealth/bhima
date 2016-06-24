/**
 * @module patients/pictures
 *
 * @description
 * The input for uploading patient images  
 * It should accept any image type (.png, .gif, etc) but reject non-image types in Client Side. 
 *
 * This controller encapsulates the HTTP API backing the patient documents feature
 * in the application.
 *
 * @requires multer
 * @requires db
 * @requires node-uuid
 * @requires BadRequest
 */

'use strict';

const db = require('../../../lib/db');
const uuid = require('node-uuid');
const BadRequest = require('../../../lib/errors/BadRequest');
const Topic = require('../../../lib/topic');

exports.set = set;

/**
 * @method set
 *
 * @description
 * This method checked if req.files.length is isset
 * Update the field avatar in table patient
 * Transfert the field in Server
 *
 * POST /patients/:uuid/pictures
 */
function set(req, res, next) {

  if (req.files.length === 0) {
    return next(
      BadRequest('Expected at least one file upload but did not receive any files.')
    );
  }

  var data = {};

  data.avatar = req.files[0].link;

  var buid = db.bid(req.params.uuid);

  const sql =
    'UPDATE patient SET ? WHERE uuid = ?';

  let records = req.files.map(file => {
    return [
      db.bid(file.filename),
      db.bid(req.params.uuid),
      file.originalname,
      file.link,
      file.mimetype,
      file.size,
      req.session.user.id
    ];
  });

  db.exec(sql,  [ data, buid ])
  .then(function (updatedPatient) {
    res.status(200).json(updatedPatient);
  })
  .catch(next)
  .done();
}


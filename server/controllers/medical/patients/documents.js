/**
 * @module patients/documents
 *
 * @description
 * Patient documents provides a useful method for patient medical documents to
 * be pinned to individual patients.  While the application does not officially
 * support medical records, associating medical documents with patients allows a
 * lightweight medical records framework.
 *
 * This controller encapsulates the HTTP API backing the patient documents feature
 * in the application.
 *
 * @requires db
 * @requires node-uuid
 * @requires BadRequest
 * @requires NotFound
 */


const uuid = require('node-uuid');

const db = require('../../../lib/db');
const Topic = require('../../../lib/topic');

const BadRequest = require('../../../lib/errors/BadRequest');
const NotFound = require('../../../lib/errors/NotFound');

const identifiers = require('../../../config/identifiers');

exports.create = create;
exports.list = list;
exports.delete = remove;
exports.deleteAll = removeAll;

/**
 * @method create
 *
 * @description
 * This method creates records in the `patient_document` for database table to
 * store medical documents.  It expects that the `multer` middleware has been
 * used upstream of this method to save files to to the hard disk.  The only
 * thing store in the database are references to the files on disk, rather than
 * the actual files themselves.
 *
 * POST /patients/:uuid/documents
 */
function create(req, res, next) {

  if (!req.files || req.files.length === 0) {
    return next(
      new BadRequest('Expected at least one file upload but did not receive any files.')
    );
  }

  const sql =
    'INSERT INTO patient_document (uuid, patient_uuid, label, link, mimetype, size, user_id) VALUES ?;';

  // make sure the records are properly formatted
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

  db.exec(sql,  [ records ])
  .then(function(rows) {

    // publish a patient update event
    Topic.publish(Topic.channels.MEDICAL, {
      event: Topic.events.UPDATE,
      entity: Topic.entities.PATIENT,
      user_id : req.session.user.id,
      id : req.params.uuid
    });

    res.status(201).json({
      uuids : records.map(row => uuid.unparse(row[0]))
    });
  })
  .catch(next)
  .done();
}


/**
 * @method list
 *
 * @description
 * Reads a list of patient documents found in the database.  This also formats
 * a link for the client to directly download the
 *
 * GET /patients/:uuid/documents
 */
function list(req, res, next) {
  const patientUuid = req.params.uuid;
  const dir = process.env.UPLOAD_DIR;

  let sql = `
    SELECT BUID(d.uuid) AS uuid, d.label, d.link, d.timestamp, d.mimetype, d.size,
    u.id AS user_id, u.display_name
    FROM patient_document d JOIN user u ON u.id = d.user_id
    WHERE patient_uuid = ?;
  `;

  db.exec(sql, [db.bid(patientUuid)])
  .then(function (rows) {

    // publish a patient update event
    Topic.publish(Topic.channels.MEDICAL, {
      event: Topic.events.UPDATE,
      entity: Topic.entities.PATIENT,
      user_id : req.session.user.id,
      id : req.params.uuid
    });

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
 * @method deleteAll
 *
 * @description
 * This method removes all documents associated with a patient from the
 * database.
 *
 * @todo - is this type of naming scheme acceptable?
 *
 * DELETE /patients/:uuid/documents/all
 */
function removeAll(req, res, next) {
  const patientUuid = req.params.uuid;

  let sql =
    'DELETE FROM patient_document WHERE patient_uuid = ?;';

  db.exec(sql, [db.bid(patientUuid)])
  .then(function (rows) {
    res.sendStatus(204);
  })
  .catch(next)
  .done();
}

/**
 * @method delete
 *
 * @description
 * Deletes a single patient document from the database and disk specified by
 * the document id
 *
 * DELETE /patients/:uuid/documents/:documentUuid
 */
function remove(req, res, next) {
  const patientUuid = req.params.uuid;
  const documentUuid = req.params.documentUuid;

  let sql = `
    DELETE FROM patient_document WHERE patient_uuid = ? AND uuid = ?;
  `;

  db.exec(sql, [db.bid(patientUuid), db.bid(documentUuid)])
  .then(function (rows) {

    if (!rows.affectedRows) {
      throw new NotFound(
        `Could not find document with uuid ${documentUuid}.`
      );
    }

    // publish an update event
    Topic.publish(Topic.channels.MEDICAL, {
      event: Topic.events.UPDATE,
      entity: Topic.entities.PATIENT,
      user_id : req.session.user.id,
      id : req.params.uuid
    });

    res.sendStatus(204);
  })
  .catch(next)
  .done();
}

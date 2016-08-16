/**
 * @module medical/patients/checkin
 *
 * @description
 * This controller is responsible for the Patient Check In feature, this allows a hospital to track when returning
 * patients visit the hospital.
 *
 * It is responsible for reading and writing to the `patient_visit` database table as well as responding to HTTP
 * requests.
 *
 * @requires  node-uuid
 * @requires  lib/db
 * @requires  lib/topic
 * @requires  lib/errors/BadRequest
 */
'use strict';

const uuid  = require('node-uuid');

const db    = require('../../../lib/db');
const topic = require('../../../lib/topic');

const BadRequest = require('../../../lib/errors/BadRequest');
const q     = require('q');

exports.list = list;
exports.create = create;
exports.latest = latest;

/**
 * @method list
 *
 * @description
 * List all records of the patients visit given a specified identifier.
 *
 * GET /patients/:uuid/visits
 */
function list(req, res, next) {
  const patientUuid = req.params.uuid;
  let limitQuery = '';

  if (req.query.limit) {
    const limit = Number(req.query.limit);

    // validate query string is valid - do not template in anything sent from the client
    if (isNaN(limit)) {
      throw new BadRequest('limit query must be a valid number');
    }
    limitQuery = `LIMIT ${limit}`;
  }

  let listVisitsQuery =
    `
      SELECT
        BUID(patient_uuid) as patient_uuid, start_date, end_date, user_id, username
      FROM patient_visit
      JOIN user on patient_visit.user_id = user.id
      WHERE patient_uuid = ?
      ORDER BY start_date DESC
      ${limitQuery}
    `;

  db.exec(listVisitsQuery, [db.bid(patientUuid)])
    .then(function (visits) {
      res.status(200).json(visits);
    })
    .catch(next)
    .done();
}

/**
 * @method checkin
 *
 * @description
 * Write a record into the patient_visit table checking a patient into a visit.
 *
 * POST /patients/:uuid/checkin
 */
function create(req, res, next) {
  const patientUuid = req.params.uuid;

  let checkinQuery =
    `
      INSERT INTO patient_visit
        (uuid, patient_uuid, start_date, user_id)
      VALUES
        (?, ?, CURRENT_TIMESTAMP, ?)
    `;

  db.exec(checkinQuery, [db.bid(uuid.v4()), db.bid(patientUuid), req.session.user.id])
    .then(function (checkin) {
      res.status(201).json({
        uuid : patientUuid
      });

      // public patient change (checkin) event
      topic.publish(topic.channels.MEDICAL, {
        event: topic.events.UPDATE,
        entity: topic.entities.PATIENT,
        user_id: req.session.user.id,
        uuid: patientUuid
      });
    })
    .catch(next)
    .done();
}

/*
Search for information about the latest bill
*/
function latest(req, res, next) {
  const uid = db.bid(req.params.uuid);
  var invoiceLatest;

  let sql =
    `SELECT invoice.uuid, invoice.debtor_uuid, invoice.date, CONCAT(user.first, user.last) as user,
     invoice.cost
    FROM invoice 
    JOIN user ON user.id = invoice.user_id
    WHERE debtor_uuid = ?
    ORDER BY date DESC
    LIMIT 1`;

  db.exec(sql, [uid])
    .then(function (result) {
      invoiceLatest = result[0];
      var uuid = invoiceLatest.uuid;

    sql =
      `SELECT BUID(i.uuid) as uid, CONCAT(project.abbr, invoice.reference) as reference,
        credit, debit, (debit - credit) as balance, BUID(entity_uuid) as entity_uuid
      FROM (
        SELECT uuid, SUM(debit) as debit, SUM(credit) as credit, entity_uuid
        FROM (
          SELECT record_uuid as uuid, debit, credit, entity_uuid
          FROM combined_ledger
          WHERE record_uuid IN (?) AND entity_uuid = ?
        UNION ALL
          SELECT reference_uuid as uuid, debit, credit, entity_uuid
          FROM  combined_ledger
          WHERE reference_uuid IN (?) AND entity_uuid = ?
        ) AS ledger
        GROUP BY entity_uuid
      ) AS i JOIN invoice ON i.uuid = invoice.uuid
      JOIN project ON invoice.project_id = project.id `;

    var sql2 =
      `SELECT COUNT(BUID(i.uuid)) as numberPayment
      FROM (
        SELECT uuid,  debit, credit, entity_uuid
        FROM (
          SELECT record_uuid as uuid, debit, credit, entity_uuid
          FROM combined_ledger
          WHERE record_uuid IN (?) AND entity_uuid = ? AND debit = 0
        UNION ALL
          SELECT reference_uuid as uuid, debit, credit, entity_uuid
          FROM  combined_ledger
          WHERE reference_uuid IN (?) AND entity_uuid = ? AND debit = 0
        ) AS ledger
      ) AS i JOIN invoice ON i.uuid = invoice.uuid
      JOIN project ON invoice.project_id = project.id `;


    var execSql = db.exec(sql, [uuid, uid, uuid, uid]);
    var execSql2 = db.exec(sql2, [uuid, uid, uuid, uid]);

    return q.all([execSql, execSql2]);
  })
  .then(function (results) {
    var invoices = results[0];
    var numberPayment = results[1][0].numberPayment;

    invoices[0].uuid = invoiceLatest.uuid;
    invoices[0].debtor_uuid = invoiceLatest.debtor_uuid;
    invoices[0].user = invoiceLatest.user;
    invoices[0].date = invoiceLatest.date;
    invoices[0].cost = invoiceLatest.cost;
    invoices[0].numberPayment = numberPayment;

    res.status(200).send(invoices);
  })
  .catch(next)
  .done();
}  
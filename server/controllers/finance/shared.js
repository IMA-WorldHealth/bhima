/**
 * @overview shared.js
 *
 * @description
 * This module contains helper functions for operating on transactions.  These
 * helper functions do things like like
 *
 * @requires lib/db
 * @requires lib/errors/BadRequest
 */

const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');

exports.getTransactionReferences = getTransactionReferences;
exports.getTransactionRecords = getTransactionRecords;
exports.isRemovableTransaction = isRemovableTransaction;

exports.getRecordTextByUuid = getRecordTextByUuid;
exports.getEntityTextByUuid = getEntityTextByUuid;


/**
 * @function getRecordTextByUuid
 *
 * @description
 * This function returns a record's human readable text string by its uuid.
 */
function getRecordTextByUuid(uuid) {
  const sql = `
    SELECT text FROM document_map WHERE uuid = ?;
  `;

  return db.one(sql, db.bid(uuid));
}

/**
 * @function getEntityTextByUuid
 *
 * @description
 * This function returns an entity's human readable text from the entity_map
 * table.
 */
function getEntityTextByUuid(uuid) {
  const sql = `
    SELECT text FROM entity_map WHERE uuid = ?;
  `;

  return db.one(sql, db.bid(uuid));
}

/**
 * @function getTransactionReferences
 *
 * @description
 * This function will find the uuids of any transactions that reference the
 * provided transaction's uuid.
 *
 * @param {String} transactionUuid - the record_uuid of the transaction
 */
function getTransactionReferences(transactionUuid) {
  const sql = `
    SELECT DISTINCT uuid, text FROM (
      SELECT dm.uuid, dm.text
      FROM posting_journal AS j JOIN document_map AS dm ON
        j.reference_uuid = dm.uuid
      WHERE j.reference_uuid = ?

      UNION ALL

      SELECT dm.uuid, dm.text
      FROM general_ledger AS g JOIN document_map AS dm ON
        g.reference_uuid = dm.uuid
      WHERE g.reference_uuid = ?
    )c;
  `;

  const buid = db.bid(transactionUuid);

  return db.exec(sql, [buid, buid]);
}

/**
 * @function getTransactionRecords
 *
 * @description
 * Returns the transaction from the posting journal and general_ledger.
 */
function getTransactionRecords(uuid) {
  const sql = `
      SELECT BUID(j.uuid) AS uuid, trans_id, BUID(record_uuid) AS record_uuid,
        trans_date, debit_equiv, credit_equiv, currency_id,
        BUID(reference_uuid) AS reference_uuid,
        BUID(entity_uuid) AS entity_uuid, 0 AS posted,
        document_map.text AS identifier
      FROM posting_journal AS j JOIN document_map ON
        j.record_uuid = document_map.uuid
      WHERE record_uuid = ?

      UNION ALL

      SELECT BUID(j.uuid) AS uuid, trans_id, BUID(record_uuid) AS record_uuid,
        trans_date, debit_equiv, credit_equiv, currency_id,
        BUID(reference_uuid) AS reference_uuid,
        BUID(entity_uuid) AS entity_uuid, 1 AS posted,
        document_map.text AS identifier
      FROM general_ledger AS j JOIN document_map ON
        j.record_uuid = document_map.uuid
      WHERE record_uuid = ?
  `;

  return db.exec(sql, [db.bid(uuid), db.bid(uuid)]);
}


function isRemovableTransaction(uuid) {
  // get all the rows of the transaction
  return getTransactionRecords(uuid)
    .then(rows => {
      const isPosted = rows[0].posted;
      if (isPosted) {
        throw new BadRequest('This transaction is already posted.', 'TRANSACTIONS.ERRORS.TRANSACTION_POSTED');
      }

      // check if the transaction has references elsewhere
      return getTransactionReferences(uuid);
    })
    .then(references => {
      const isReferenced = references.length > 0;
      if (isReferenced) {
        throw new BadRequest('This transaction is referenced.', 'TRANSACTIONS.ERRORS.TRANSACTION_REFERENCED');
      }
    });
}

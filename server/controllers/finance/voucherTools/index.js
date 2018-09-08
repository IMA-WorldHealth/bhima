/**
 * @module finacne/voucherTools
 *
 * @description
 * A collection of utilities for automating common financial transactions
 * making use of generating voucher documents.
 *
 * @required db
 * @requires BadRequest
 * @requires journal
 */

const { uuid } = require('../../../lib/util');

const db = require('../../../lib/db');
const BadRequest = require('../../../lib/errors/BadRequest');

const journal = require('../journal');
const vouchers = require('../vouchers');

exports.correct = correct;

/**
 * POST /journal/:uuid/correct
 *
 * @method correct
 *
 * @description
 * Create two vouchers creating a mistake in an already posted transaction. The
 * first voucher reverses the original transaction and the second creates a
 * new voucher with new values. All of these operations should be contained
 * within a single transaction or rolled back given any issues.
 *
 * HTTP route is attempting to match the generic transaction reverse route that
 * can be found at /journal/:uuid/reverse.
 *
 * Returns voucher ids for the reversal and correction vouchers.
 */
function correct(req, res, next) {
  const transactionId = req.params.uuid;

  // details for the transaction that should be corrected (this is what will be
  // reversed)
  const transactionDetails = req.body.transactionDetails;

  // rows that should replace the transaction that is being reversed (these are
  // used to create the new voucher)
  const correction = req.body.correction;

  const userId = req.session.user.id;

  console.log('Server got transaction details from client', transactionDetails);
  console.log('Server got proposed correction from client', correction);

  // result of correctTransaction call should be a formatted object with details
  // about the correction
  // {
  //  reversedTransactionUuid
  //  reversalVoucherUuid
  //  correctionVoucherUuid
  //  voucherDetails {
  //    reversal : {}
  //    correction : {}
  //  }
  // }

  // transactionDetails - details of transaction to be reversed
  // correction - proposed rows to be included in a new voucher
  correctTransaction(transactionDetails, correction, userId)
    .then((correctionResults) => fetchCorrectionVoucherDetails)
    .then((correctionVoucherDetails) => res.status(201).json(correctionVoucherDetails))
    .catch((error) => {
      console.log('external HTTP route error handler', error);
      return next(error);
    })
    .done();
}


// expected voucherDetails
// {
//  description - optional descrtiption parameter to be used on the reversal and correction voucher
//
//
// }
function correctTransaction(transactionDetails, correction, userId) {
  const actions = {};
  const transactionUuid = transactionDetails.record_uuid;

  // first check if this transaction has already been reversed
  // @TODO(sfount) if there is an exisitng reversal on the transaction, package
  //               the ID of that voucher in the BadRequest - this way the client
  //               can report on exactly which document is the stopping them
  //
  //
  //

  // individual seperate controllers followed by a cleanup method are used in favour
  // of one huge custom transaction for two reasons:
  // 1. all of the code for creating vouchers and reversing transactions exist, recreating this would be repeating code
  // 2. large transactions are expensive for the database to perform and can lead to performance issues
  return journal.reverseTransaction(db.bid(transactionUuid), userId, transactionDetails.description)
    .then((reversalResult) => {
      // @TODO(sfount) currently all routes that make corrections use system transaction type 10, this is labbeled
      //               as 'CREDIT_NOTE', this isn't strictly true for all corrections and should be updated
      const REVERSAL_TYPE_ID = 10;

      // reversal has been corectly executed; this returns the voucherUuid for this document
      actions.reversal = { uuid : reversalResult.uuid };

      console.log('reversal was executed correcly');

      // @FIXME(sfount) in theory the correction should be made towards the same project as the original document
      //                there is no logic in the reversal process design that dictates the method here
      const formatVoucherDetails = {
        items : correction,
        type_id : REVERSAL_TYPE_ID,
        projectId : transactionDetails.project_id,
        userId,
      };
      return vouchers.createVoucher(formatVoucherDetails, userId, transactionDetails.project_id);
    })
    .then((correctionResult) => {
      // new voucher for correction has been correctly executed
      actions.correction = { uuid : correctionResult.uuid };

      console.log('correction voucher was created correcly');

      // all transactions successful, package results with all generate ids
      return actions;
    })
    .catch((error) => {

      console.log('custom internal error handler called', error);

      return correctionErrorHandler(actions)
        .then((result) => {

          console.log('internal error has successfully cleaned up vouchers');
          // database has been correctly cleaned up
          // propegate error back up to HTTP method to return with `next`
          throw error;
        });
    })
}

// custom internal error handler to allow multiple transactions across seperate
// server controllers without bundling them all in the same database transaction
function correctionErrorHandler(actions) {
  // ensure all potential operations that have taken place are cleaned up
  const cleanupVoucherItemsQuery = 'DELETE FROM voucher_items WHERE voucher_uuid IN (?)';
  const cleanupVoucherQuery = 'DELETE FROM voucher WHERE uuid IN (?)';
  const cleanupEntityQuery = 'CALL UndoEntityReversal(?)';
  const voucherIds = Object.keys(actions)
    .filter((key) => key && actions[key].uuid)
    .map((key) => actions[key].uuid);

  console.log('voucher ids', voucherIds);
  console.log('actions', actions);


  // @TODO(rm console logs with this)
  // return db.exec(cleanupVoucherItemsQuery, [voucherIds])
  //   .then(() => db.exec(cleanupVoucherQuery, [voucherIds]));
  //
  if (voucherIds.length) {

    return db.exec(cleanupVoucherItemsQuery, [voucherIds])
      .then(() => {
        console.log('cleanup voucher items run well');
        return db.exec(cleanupVoucherQuery, [voucherIds])
      })
      .then(() => {
        console.log('cleanup voucher run well');

        // if anything has happened at all successfuly it will be the reversal step
        // this is the only document that could have been an entity that was reversed
        return db.exec(cleanupEntityQuery, [actions.reversal.uuid]);
      })
      .then(() => {
        console.log('enetity cleanup run well');
      });
  }

  // voucher ids is empty - no actions have been carried out and no cleanup is required
  return Promise.resolve();
}

function _fetchCorrectionVoucherDetails(correctionResults) {

}

function _collectReversalQuery(transactionUuid, userId, description) {
  const uuid = uuid();
  const query = 'CALL ReverseTransaction(?, ?, ?, ?)';
  const params = [db.bid(transactionUuid), userId, description, db.bid(uuid)]
  return { uuid, query, params };
}

function _collectCorrectionQuery(transactionUuid, correctedVoucherDetails) {

}

// accepts string transaction UUID
// returns true if a transaction with a given ID has already been corrected
function _isTransactionCorrected(transactionId) {
  const CANCELLED_ID = 10;
  const query = `
    SELECT uuid
    FROM voucher
    WHERE voucher.type_id = ${CANCELLED_ID} AND voucher.reference_uuid = ?
  `;

  return db.exec(query, [db.bid(transactionId)])
    .then((voucherRows) => voucherRows.length);
}

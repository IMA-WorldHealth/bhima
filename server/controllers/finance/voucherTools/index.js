/**
 * @module finacne/voucherTools
 *
 * @description
 * A collection of utilities for automating common financial transactions
 * making use of generating voucher documents.
 *
 * @required db
 * @requires journal
 */
const db = require('../../../lib/db');

const journal = require('../journal');
const vouchers = require('../vouchers');
const transactions = require('../transactions');

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
  // transactionDetails - details for the transaction that should be corrected (this is what will be
  // reversed)
  // correction - rows that should replace the transaction that is being reversed (these are
  // used to create the new voucher)
  const { transactionDetails, correction } = req.body;
  const userId = req.session.user.id;

  const response = {};

  correctTransaction(transactionDetails, correction, userId)
    .then((correctionActionResults) => {
      response.actions = correctionActionResults;
      return _fetchCorrectionVoucherDetails(correctionActionResults);
    })
    .then((details) => {
      response.details = details;
      res.status(201).json(response);
    })
    .catch(next)
    .done();
}

// transactionDetails
// shared transaction data that is required to create a voucher document
// {
//  description, - optional descrtiption parameter to be used on the reversal and correction voucher
//  currency_id,
//  user_id
// }
//
// correction
// Array of rows that should make up the voucher items, these rows can differ from the original
// transaction amounts
function correctTransaction(transactionDetails, correction, userId) {
  const actions = {};
  const transactionUuid = transactionDetails.record_uuid;

  // first check if this transaction has already been reversed
  // @TODO(sfount) if there is an exisitng reversal on the transaction, package
  //               the ID of that voucher in the BadRequest - this way the client
  //               can report on exactly which document is the stopping them

  // individual seperate controllers followed by a cleanup method are used in favour
  // of one huge custom transaction for two reasons:
  // 1. all of the code for creating vouchers and reversing transactions exist, recreating this would be repeating code
  // 2. large transactions are expensive for the database to perform and can lead to performance issues
  return journal.reverseTransaction(
    db.bid(transactionUuid),
    userId,
    transactionDetails.description
  )
    .then((reversalResult) => {
      // @TODO(sfount) currently all routes that make corrections use system transaction type 10, this is labbeled
      //               as 'CREDIT_NOTE', this isn't strictly true for all corrections and should be updated
      const REVERSAL_TYPE_ID = 10;

      // reversal has been corectly executed; this returns the voucherUuid for this document
      actions.reversal = { uuid : reversalResult.uuid };

      const formatVoucherDetails = {
        items : correction,
        type_id : REVERSAL_TYPE_ID,
        user_id : userId,
        currency_id : transactionDetails.currency_id,
        description : transactionDetails.correctionDescription,

        // @FIXME(sfount) currently voucher amounts are calculated on the client under
        //                modules/vouchers/vouchers.service.js - this just performs a reduce
        //                voucher logic should be refactored to calculate amount in MySQL or on the server
        //                `createVoucher` end point
        amount : correction.reduce((sum, row) => sum + row.debit, 0),
      };
      return vouchers.createVoucher(formatVoucherDetails, userId, transactionDetails.project_id);
    })
    .then((correctionResult) => {
      // new voucher for correction has been correctly executed
      actions.correction = { uuid : correctionResult.uuid };

      // all transactions successful, package results with all generate ids
      return actions;
    })
    .catch((error) => {
      // internal error handling, undo all potential changes
      return correctionErrorHandler(actions)
        .then(() => {
          // database has been correctly cleaned up
          // propegate error back up to HTTP method to return with `next`
          throw error;
        });
    });
}

// custom internal error handler to allow multiple transactions across seperate
// server controllers without bundling them all in the same database transaction
function correctionErrorHandler(actions) {
  // @TODO(sfount) cleaning up after transactions/ creations turned out to be a lot
  //               more involved than I had originally anticipated
  // @TODO(sfount) thoroughly clean test up procedures in integration tests

  // ensure all potential operations that have taken place are cleaned up
  const cleanupVoucherItemsQuery = 'DELETE FROM voucher_item WHERE voucher_uuid IN (?)';
  const cleanupVoucherQuery = 'DELETE FROM voucher WHERE uuid IN (?)';
  const cleanupEntityQuery = 'CALL UndoEntityReversal(?)';
  const voucherIds = Object.keys(actions)
    .filter((key) => key && actions[key].uuid)
    .map((key) => db.bid(actions[key].uuid));

  if (voucherIds.length) {

    return db.exec(cleanupVoucherItemsQuery, [voucherIds])
      .then(() => db.exec(cleanupVoucherQuery, [voucherIds]))
      .then(() => {
        // if anything has happened at all successfuly it will be the reversal step
        // this is the only document that could have been an entity that was reversed
        return db.exec(cleanupEntityQuery, [db.bid(actions.reversal.uuid)]);
      })
      .then(() => transactions.deleteTransaction(actions.reversal.uuid));
  }

  // voucher ids is empty - no actions have been carried out and no cleanup is required
  return Promise.resolve();
}

// get full voucher information for both the reversal voucher and the correction voucher
function _fetchCorrectionVoucherDetails(correctionActions) {
  const details = {};
  return vouchers.lookupVoucher(correctionActions.reversal.uuid)
    .then((reversalVoucher) => {
      details.reversal = reversalVoucher;
      return vouchers.lookupVoucher(correctionActions.correction.uuid);
    })
    .then((correctionVoucher) => {
      details.correction = correctionVoucher;
      return details;
    });
}

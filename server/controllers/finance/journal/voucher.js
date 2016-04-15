/**
 *
 *
 */

'use strict';

const core = require('./core');
const q = require('q');

/**
 * @param {object} transaction - the transaction query object
 * @param {object} uuid - the binary voucher uuid being posted to the journal
 *
 * This function posts data from the `voucher` table to the posting journal.
 */
module.exports = function post(transaction, uuid) {

  transaction

    // set up the @date SQL variable
    .addQuery(`SET @date = (SELECT date FROM voucher WHERE uuid = ?);`, [uuid])

    // set up the @enterpriseId SQL variable
    .addQuery(
      `SET @enterpriseId = (
        SELECT e.id FROM enterprise AS e JOIN project AS p JOIN voucher AS v
          ON e.id = p.enterprise_id AND p.id = v.project_id
        WHERE v.uuid = ?);`, [uuid]
    )

    // set the @projectId SQL variable
    .addQuery(
      `SET @projectId = (
        SELECT project_id FROM voucher WHERE voucher.uuid = ?
      );`, [uuid]
    )

    // set up the @currencyId SQL variable
    .addQuery(
      `SET @currencyId = (
        SELECT currency_id FROM voucher WHERE voucher.uuid = ?
      );`, [uuid]
    );


  // this function sets up the dates, fiscal year, and exchange rate for this
  // posting session and ensures they all exist before attempting to write to
  // the posting journal.
  core.setup(transaction);

  /**
   * @todo - this templates in 'D' as the debtor/creditor type
   * @todo - this adds origin_id = 1.  Should we keep origin around?
   * @todo - rounding?!
   */
  transaction

    .addQuery(
      `INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
        trans_id, trans_date, record_uuid, description, account_id, debit,
        credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
        entity_type, reference_uuid, comment, origin_id, user_id, cc_id, pc_id)
      SELECT
        HUID(UUID()), v.project_id, @fiscalId, @periodId, @transId, v.date,
        v.uuid, v.description, vi.account_id, vi.debit, vi.credit,
        vi.debit * @exchange, vi.credit * @exchange, v.currency_id,
        vi.entity_uuid, 'D', vi.document_uuid, NULL, 1, v.user_id, NULL, NULL
      FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
      WHERE v.uuid = ?;`, [uuid]
    );

  return transaction.execute()
    .catch(function (error) {
      /** @todo - custom error handling based on SQLSTATE */
      return q.reject(error);
    });
};

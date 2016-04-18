'use strict';

const core = require('./core');

/**
 * This function is responsible for posting new records from the `voucher` table
 * into the posting journal.  It expects to be passed a transaction object and
 * the (binary) uuid of the voucher to be posted.
 *
 * Using the core.js file, it initiates checks to make sure that the data is
 * valid before posting.  If any invalid data is found, MySQL signals an error,
 * ending the transaction, and clearing all temporary variables.
 *
 * @param {object} transaction - the transaction query object
 * @param {object} uuid - the binary voucher uuid being posted to the journal
 *
 */
module.exports = function post(transaction, uuid) {

  transaction

    // set up the SQL variables for core.js to consume
    .addQuery(`
      SELECT voucher.date, enterprise.id, project.id, voucher.currency_id
      INTO @date, @enterpriseId, @projectId, @currencyId
      FROM voucher JOIN project JOIN enterprise ON
        voucher.project_id = project.id AND
        project.enterprise_id = enterprise.id
      WHERE voucher.uuid = ?;
    `, [uuid]);


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
    .catch(core.handler);
};

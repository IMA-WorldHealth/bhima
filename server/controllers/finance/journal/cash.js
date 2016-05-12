'use strict';

const core = require('./core');

/**
 * This module is responsible for posting new records from the `cash` table into
 * the posting journal. It expects to receive a transaction object, and (binary)
 * cash uuid to post into the `posting_journal` table.
 *
 * Importantly, this file handles not only the posting procedure, but also error
 * cases that may arise from lack of fiscal years, exchange rates, and the like.
 * These are handled at the transaction level, within a MySQL function, and
 * bubbled up through journal/core.js.
 *
 * @module finance/journal/cash
 * @requires finance/journal/core
 *
 * @todo - introduce code to perform generic gain/loss on rounding using the SQL
 * variables @gainAccountId and @lossAccountId.
 */
function post(transaction, uuid) {

  transaction

    // set up SQL variables for the posting journal
    .addQuery(`
      SELECT cash.date, enterprise.id, project.id, cash.currency_id
      INTO @date, @enterpriseId, @projectId, @currencyId
      FROM cash JOIN project JOIN enterprise ON
        cash.project_id = project.id AND
        project.enterprise_id = enterprise.id
      WHERE cash.uuid = ?;
    `, [uuid]);

  // this function sets up the dates, fiscal year, and exchange rate for this
  // posting session and ensures they all exist before attempting to write to
  // the posting journal.
  core.setup(transaction);

  /**
   * @todo - this templates in 'D' as the debtor/creditor type
   * @todo - this adds origin_id = 1.  Should we keep origin around?
   * @todo - rounding?!
   * @todo - method calls the internal UUID() function of MySQL, which is not a
   * version 4 UUID.  How will this affect the uuid parsing of reads?
   * @todo - should we be inserting to the posting journal in record_uuid sorted
   * order?  Will that speed up reads?  With an INDEX on record_uuid?
   */
  transaction

    .addQuery(
      `INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
        trans_id, trans_date, record_uuid, description, account_id, debit,
        credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
        entity_type, reference_uuid, comment, origin_id, user_id, cc_id, pc_id)
      SELECT
        HUID(UUID()), c.project_id, @fiscalId, @periodId, @transId, c.date,
        c.uuid, c.description, ci.account_id, ci.debit, ci.credit,
        ci.debit * @exchange, ci.credit * @exchange, c.currency_id,
        ci.entity_uuid, 'D', ci.document_uuid, NULL, 1, c.user_id, NULL, NULL
      FROM cash AS c JOIN cash_item AS ci ON c.uuid = ci.voucher_uuid
      WHERE c.uuid = ?;`, [uuid]
    );


  // clean up the transaction's local variables
  transaction = core.cleanup(transaction);
  return transaction.execute()
    .catch(core.handler);
}

module.exports = post;

'use strict';

const core = require('./core');

/**
 * This module will post new records from the `invoice` table into the posting
 * journal.  It is expected to receive a transaction object and a (binary) invoice
 * uuid to post into the `posting_journal` table.
 *
 * In order to post invoices, the module must implement billing services, subsidies,
 * caution calculation and discounts..
 *
 */
module.exports = function post(transaction, uuid) {

  transaction

    // set up SQL variables for the posting journal checks
    .addQuery(`
      SELECT invoice.date, enterprise.id, project.id, enterprise.currency_id
      INTO @date, @enterpriseId, @projectId, @currencyId
      FROM invoice JOIN project JOIN enterprise ON
        invoice.project_id = project.id AND
        project.enterprise_id = enterprise.id
      WHERE invoice.uuid = ?;
    `, [uuid]);

  // set up shared variables (such as transId and detect errors)
  transaction = core.setup(transaction);

  // actually post the transaction
  transaction
    .addQuery(`
      CALL PostPatientInvoice(
        ?, @transId, @projectId, @fiscalYearId, @periodId, @currencyId
      );
    `, [uuid]);

  // clean up the transaction's local variables
  transaction = core.cleanup(transaction);

  return transaction.execute()
    .catch(core.handler);
};

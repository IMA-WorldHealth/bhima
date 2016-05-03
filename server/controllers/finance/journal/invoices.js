'use strict';

const core = require('./core');

/**
 * This module will post new records from the `sale` table into the posting
 * journal.  It is expected to receive a transaction object and a (binary) sale
 * uuid to post into the `posting_journal` table.
 *
 * In order to post sales, the module must implement billing services, subsidies,
 * caution calculation and discounts..
 *
 */
module.exports = function post(transaction, uuid) {

  transaction

    // set up SQL variables for the posting journal checks
    .addQuery(`
      SELECT sale.date, enterprise.id, project.id, enterprise.currency_id
      INTO @date, @enterpriseId, @projectId, @currencyId
      FROM sale JOIN project JOIN enterprise ON
        sale.project_id = project.id AND
        project.enterprise_id = enterprise.id
      WHERE sale.uuid = ?;
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

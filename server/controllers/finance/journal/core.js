/**
 * Posting Journal Core
 *
 * This core module of the posting journal sets the posting session for
 * modules that will be posting data to the posting journal.
 *
 *
 *
 */

'use strict';

/**
 * Set up the SQL transaction with default variables useful for posting records
 * to the posting journal.
 *
 * @param {object} transaction - the transaction object
 *
 * NOTE - this expects SQL variables "@date" and "@enterpriseId" to be set.
 */
exports.setup = function setup(transaction) {

  transaction

    // set up the @fiscalId SQL variable
    .addQuery(
      `SET @fiscalId = (
        SELECT id FROM fiscal_year
        WHERE @date BETWEEN
          DATE(CONCAT(start_year, '-', start_month, '-01'))
        AND
          DATE(ADDDATE(CONCAT(start_year, '-', start_month, '-01'), INTERVAL number_of_months MONTH))
        AND
          enterprise_id = @enterpriseId
      );`
    )

    // set the @periodId SQL variable
    .addQuery(
      `SET @periodId = (
        SELECT id FROM period WHERE
          DATE(@date) BETWEEN DATE(period_start) AND DATE(period_stop)
        AND
          fiscal_year_id = @fiscalId
      );`
    )

    // set the @transId SQL variable
    .addQuery(
      `SET @transId = (SELECT CONCAT(abbr, IFNULL(MAX(increment), 1)) AS id FROM (
        SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment
        FROM posting_journal JOIN project ON posting_journal.project_id = project.id
        WHERE posting_journal.project_id = @projectId
      UNION
        SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment
        FROM general_ledger JOIN project ON general_ledger.project_id = project.id
        WHERE general_ledger.project_id = @projectId)c
      );`
    )

    // set up the @enterpriseCurrencyId
    .addQuery(`
      SET @enterpriseCurrencyId = (
        SELECT currency_id FROM enterprise WHERE id = @enterpriseId
      );
    `)

    // set up the @rate SQL variable
    .addQuery(`
      SET @rate = (
        SELECT rate FROM exchange_rate
        WHERE enterprise_id = @enterpriseId
          AND currency_id = @currencyId
          AND date <= @date
      ORDER BY date DESC
      LIMIT 1);
    `)

    // if the currency is the enterprise currency, we will set @exchange to 1,
    // otherwise it is 1/@rate
    .addQuery(
      `SET @exchange = (SELECT IF(@currencyId = @enterpriseCurrencyId, 1, 1/@rate));`
    )

    // error handling query - uses stored procedure PostingJournalErrorHandler
    // to make sure we have all the SQL variables properly set (not NULL);
    .addQuery(`
      CALL PostingJournalErrorHandler(
        @enterpriseId, @projectId, @fiscalId, @periodId, @exchange, @date
      );
    `);

  return transaction;
};



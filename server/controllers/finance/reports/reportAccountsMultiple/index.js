const _ = require('lodash');
const q = require('q');
const ReportManager = require('../../../../lib/ReportManager');

const AccountsExtra = require('../../accounts/extra');
const Exchange = require('../../exchange');
const Currency = require('../../currencies');
const accountExtra = require('../../accounts/extra');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');

const TEMPLATE = './server/controllers/finance/reports/reportAccountsMultiple/report.handlebars';

const { getAccountTransactions } = require('../reportAccounts/index');
/**
 * @method document
 *
 * @description
 * Renders the PDF template for the Accounts Statement Report.
 *
 * The report contains the following information:
 *  1. headers with the opening balance line and All general ledger transactions
 *  for each account.  This opening balance line is
 *  converted on the date of the `dateFrom` range.
 *
 */
async function document(req, res, next) {
  let report;
  const bundle = {};

  const params = req.query;
  params.user = req.session.user;
  params.enterprise_id = req.session.enterprise.id;
  params.isEnterpriseCurrency = (req.session.enterprise.currency_id === Number(params.currency_id));

  const accountSql = `SELECT id, type_id FROM account WHERE id=?`;

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }


  params.dateFrom = (params.dateFrom) ? new Date(params.dateFrom) : new Date();
  let accountTransactions = []; // list of all account containing transactions
  const accountIDs = [].concat(params.accountIds);
  let accounts = [];

  return q.all(accountIDs.map(id => {
    return db.one(accountSql, id);
  })).then(_accounts => {
    accounts = _accounts;
    //  we look up the currency to have all the parameters we need
    return Currency.lookupCurrencyById(params.currency_id);
  })
    .then(currency => {
      _.extend(bundle, { currency });

      // get the exchange rate for the opening balance
      return Exchange.getExchangeRate(params.enterprise_id, params.currency_id, params.dateFrom);
    })
    .then(rate => {
      bundle.rate = rate.rate || 1;
      bundle.invertedRate = Exchange.formatExchangeRateForDisplay(bundle.rate);
      return AccountsExtra.getOpeningBalanceForDate(params.account_id, params.dateFrom, false);
    })
    .then(balance => {
      const { rate, invertedRate } = bundle;

      const header = {
        date            : params.dateFrom,
        balance         : Number(balance.balance),
        credit          : Number(balance.credit),
        debit           : Number(balance.debit),
        exchangedCredit : Number(balance.credit) * rate,
        exchangedDebit : Number(balance.debit) * rate,
        exchangedBalance : Number(balance.balance) * rate,
        isCreditBalance : Number(balance.balance) < 0,
        rate,
        invertedRate,
      };

      _.extend(bundle, { header });


      return q.all(accounts.map(account => {
        params.account_id = account.id;
        params.account = account;
        return getAccountTransactions(params, bundle.header.exchangedBalance);
      }));
    })
    .then(_accountTransactions => {
      accountTransactions = _accountTransactions;
      // let get the opening balance of each account
      return q.all(accountTransactions.map(transaction => {
        return accountExtra.getOpeningBalanceForDate(transaction.account.id, params.dateFrom, false);
      }));
    })
    .then(openingBalances => {
      openingBalances.forEach((openingHeader, index) => {
        if (bundle.invertedRate !== 1) {
          openingHeader.balance = util.roundDecimal(openingHeader.balance / bundle.invertedRate, 4);
        }
        accountTransactions[index].header = openingHeader;
        // transactions for each account
        accountTransactions.forEach(accountTransaction => {
          accountTransaction.transactions.forEach((transaction, line) => {
            if (line === 0) {
              transaction.cumsum = util.roundDecimal((openingHeader.balance + transaction.exchangedBalance), 4);
            } else {
              const previosCumSum = accountTransaction.transactions[line - 1].cumsum;
              transaction.cumsum = util.roundDecimal(previosCumSum + transaction.exchangedBalance, 4);
            }
            // last transaction
            if ((line + 1) === accountTransaction.transactions.length) {
              accountTransaction.footer.exchangedCumSum = transaction.cumsum;
            }
          });
        });
      });
      _.extend(bundle, { alltransactions : accountTransactions }, { params });
      return report.render(bundle);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.document = document;

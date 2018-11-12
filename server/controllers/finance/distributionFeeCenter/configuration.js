/**
* Distribution Fee Center Configuration
*
* The configuration function first looks for accounts belonging to account references belonging to auxiliary
* cost centers, then finds all existing transactions in the ledger
* related to the accounts found at the end of the distributed
*/
const referenceAccount = require('./referenceAccount');
const generalLedger = require('../generalLedger');

function configuration(req, res, next) {
  const query = req.query;
  let refAccounts;

  const params = {
    typeFeeCenter : query.typeFeeCenter,
    fee_center_id : query.fee_center_id,
  };

  referenceAccount.auxilliary(params)
    .then((accounts) => {
      if (!accounts.length) {
        return [];
      }

      refAccounts = accounts;
      const accountsId = accounts.map(account => account.account_id);

      const options = {
        custom_period_start : query.periodFrom,
        custom_period_end : query.periodTo,
        accountsId,
        excludes_distributed : true,
        account_id : query.account_id,
        trans_id : query.trans_id,
        hrRecord : query.hrRecord,
        limit : 100,
      };

      if (query.fee_center_id || query.trans_id) {
        delete options.limit;
      }

      return generalLedger.findTransactions(options);
    })
    .then((rows) => {

      if (rows.length) {
        rows.forEach(item => {
          refAccounts.forEach(ref => {
            if (ref.account_id === item.account_id) {
              item.fee_center_id = ref.id;
              item.fee_center_label = ref.label;
            }
          });

          item.amount = item.credit ? item.credit : item.debit;
          item.amount_equiv = item.credit_equiv ? item.credit_equiv : item.debit_equiv;
        });
      }

      res.status(200).json(rows);
    })
    .catch(next);
}

exports.configuration = configuration;

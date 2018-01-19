angular.module('bhima.services')
  .service('GeneralLedgerService', GeneralLedgerService);

GeneralLedgerService.$inject = [
  'PrototypeApiService', '$httpParamSerializer', 'LanguageService',
  'AccountService',
];

/**
 * General Ledger Service
 * This service is responsible of all process with the General ledger
 */
function GeneralLedgerService(Api, $httpParamSerializer, Languages, Accounts) {
  var service = new Api('/general_ledger/');

  service.accounts = new Api('/general_ledger/accounts');

  service.download = download;
  service.slip = slip;
  service.computeAccountBalances = computeAccountBalances;

  function download(type, filters) {
    var filterOpts = filters;
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function slip(type, filters, account) {
    var filterOpts = filters;
    var defaultOpts = {
      renderer : type,
      lang : Languages.key,
      account_id : account,
      source : 3,
    };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  }

  // for simplicity, I'm using "column" here instead of doing the entire row at
  // once.  It's less efficient.
  function computeChildrenBalances(account, column) {
    // base case: no more children.
    if (!account.children || !account.children.length) {
      return account[column];
    }

    // recursively compute the child balances
    return account.children.reduce(function (debut, child) {
      return debut + computeChildrenBalances(child, column);
    }, 0);
  }

  function computeAccountBalances(accounts) {
    // first, we need to make sure that accounts are in a tree structure
    var tree = Accounts.order(accounts);

    // now we need to recursively compute the balances of the
    tree.forEach(function (account) {
      var balance = computeChildrenBalances(account, 'balance');
      console.log('Account: ', account.number, ' has balance ', balance);
      console.log('With children:', account.children);
    });

    return tree;
  }

  return service;
}

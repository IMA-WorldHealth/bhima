angular.module('bhima.services')
  .service('AccountService', AccountService);

AccountService.$inject = [
  'PrototypeApiService', 'bhConstants', 'HttpCacheService',
];

/**
 * Account Service
 *
 * A service wrapper for the /accounts HTTP endpoint.
 */
function AccountService(Api, bhConstants, HttpCache) {
  const baseUrl = '/accounts/';
  const service = new Api(baseUrl);

  // debounce the read() method by 250 milliseconds to avoid needless GET requests
  service.read = read;
  service.label = label;

  service.getBalance = getBalance;
  service.getAnnualBalance = getAnnualBalance;
  service.getOpeningBalanceForPeriod = getOpeningBalanceForPeriod;
  service.getChildren = getChildren;
  service.filterTitleAccounts = filterTitleAccounts;
  service.filterAccountByType = filterAccountsByType;
  service.downloadAccountsTemplate = downloadAccountsTemplate;

  service.flatten = flatten;
  service.order = order;

  /**
   * @method getOpeningBalance
   *
   *
   * @description
   * This method exists to get the opening balance for parameters like those
   * used to load a date range.
   */
  function getOpeningBalanceForPeriod(id, options) {
    const url = service.url.concat(id, '/openingBalance');
    return service.$http.get(url, { params : options })
      .then(service.util.unwrapHttpResponse);
  }

  const callback = (id, options) => Api.read.call(service, id, options);
  const fetcher = HttpCache(callback);

  /**
   * The read() method loads data from the api endpoint. If an id is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   * @param {Number} id - the id of the account to fetch (optional).
   * @param {Object} options - options to be passed as query strings (optional).
   * @param {Boolean} cacheBust - ignore the cache and send the HTTP request directly
   *   to the server.
   * @return {Promise} promise - resolves to either a JSON (if id provided) or
   *   an array of JSONs.
   */
  function read(id, options, cacheBust = false) {
    return fetcher(id, options, cacheBust)
      .then(handleAccounts);
  }

  function handleAccounts(accounts) {
    // if we received an array of accounts from the server,
    // label the accounts with a nice human readable label
    if (angular.isArray(accounts)) {
      accounts.forEach(humanReadableLabel);
    }

    return accounts;
  }

  function humanReadableLabel(account) {
    account.hrlabel = label(account);
  }

  function label(account) {
    return String(account.number).concat(' - ', account.label);
  }

  function getBalance(accountId, opt) {
    const url = baseUrl.concat(accountId, '/balance');
    return service.$http.get(url, opt)
      .then(service.util.unwrapHttpResponse);
  }

  function getAnnualBalance(accountId, fiscalYearId, opt) {
    const url = baseUrl.concat(accountId, '/balance/', fiscalYearId);
    return service.$http.get(url, opt)
      .then(service.util.unwrapHttpResponse);
  }

  function filterTitleAccounts(accounts) {
    return filterAccountsByType(accounts, bhConstants.accounts.TITLE);
  }

  function filterAccountsByType(accounts, type) {
    return accounts.filter(account => {
      return account.type_id !== type;
    });
  }

  /**
   * @method getChildren
   *
   * @description
   * This method builds a tree data structure of accounts and children of a
   * specified parentId.
   *
   * @returns {Array} - an array of children
   */
  function getChildren(accounts, parentId) {
    // base case: There are no child accounts
    if (accounts.length === 0) { return null; }

    // returns all accounts where the parent is the
    // parentId
    const children = accounts.filter(handleParent);

    // recursively call getChildren on all child accounts
    // and attach them as childen of their parent account
    children.forEach(handleChildren);

    function handleParent(account) {
      return account.parent === parentId;
    }

    function handleChildren(account) {
      account.children = getChildren(accounts, account.id);
    }

    return children;
  }

  /**
   * @method flatten
   *
   * @description
   * Flattens a tree data structure (must have `children` property) in place.
   *
   * @returns {Array} - the flattened array
   */
  function flatten(_tree, _depth) {
    const tree = _tree || [];
    let depth = (!angular.isDefined(_depth) || Number.isNaN(_depth)) ? -1 : _depth;
    depth += 1;

    function handleTreeLevel(array, node) {
      const items = [node].concat(node.children ? flatten(node.children, depth) : []);
      node.$$treeLevel = depth;
      return array.concat(items);
    }

    return tree.reduce(handleTreeLevel, []);
  }

  /**
   * @method order
   *
   * @description
   * Creates a proper account ordering by first creating an account tree and
   * then flattening in place.
   *
   * @param {Array} accounts - a list of account objects
   * @returns {Array} - the properly ordered list of account objects
   */
  function order(accounts) {
    // NOTE: we assume the root node is 0
    const ROOT_NODE = 0;

    // build the account tree
    const tree = getChildren(accounts, ROOT_NODE);

    // return a flattened tree (in order)
    return flatten(tree);
  }

  /**
   * @method downloadAccountsTemplate
   *
   * @description
   * Download the template file for importing accounts
   */
  function downloadAccountsTemplate() {
    const url = baseUrl.concat('template');
    return service.$http.get(url)
      .then(response => {
        return service.util.download(response, 'Import Accounts Template', 'csv');
      });
  }

  return service;
}

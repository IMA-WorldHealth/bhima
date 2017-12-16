angular.module('bhima.services')
  .service('AccountService', AccountService);

AccountService.$inject = [
  'PrototypeApiService', '$http', 'util', 'bhConstants',
];

/**
 * Account Service
 *
 * A service wrapper for the /accounts HTTP endpoint.
 */
function AccountService(Api, $http, util, bhConstants) {
  var baseUrl = '/accounts/';
  var service = new Api(baseUrl);

  service.read = read;
  service.label = label;

  service.getBalance = getBalance;
  service.getChildren = getChildren;
  service.filterTitleAccounts = filterTitleAccounts;

  service.flatten = flatten;
  service.order = order;

  /**
   * The read() method loads data from the api endpoint. If an id is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   * @param {Number} id - the id of the account to fetch (optional).
   * @param {Object} options - options to be passed as query strings (optional).
   * @return {Promise} promise - resolves to either a JSON (if id provided) or
   *   an array of JSONs.
   */
  function read(id, options) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse)
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
    var url = baseUrl.concat(accountId, '/balance');
    return $http.get(url, opt)
      .then(util.unwrapHttpResponse);
  }

  function filterTitleAccounts(accounts) {
    return accounts.filter(handleFilterTitleAccount);
  }

  function handleFilterTitleAccount(account) {
    return account.type_id !== bhConstants.accounts.TITLE;
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
    var children;

    // base case: There are no child accounts
    if (accounts.length === 0) { return null; }

    // returns all accounts where the parent is the
    // parentId
    children = accounts.filter(handleParent);

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
    var tree = _tree || [];
    var depth = isNaN(_depth) ? -1 : _depth;
    depth += 1;

    function handleTreeLevel(array, node) {
      var items = [node].concat(node.children ? flatten(node.children, depth) : []);
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

    // NOTE
    // we assume the root node is 0
    var ROOT_NODE = 0;

    // build the account tree
    var tree = getChildren(accounts, ROOT_NODE);

    // return a flattened tree (in order)
    return flatten(tree);
  }

  return service;
}

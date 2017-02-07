angular.module('bhima.services')
.service('AccountService', AccountService);

AccountService.$inject = [
  '$http', 'util', 'SessionService'
];

/**
 * Account Service
 *
 * A service wrapper for the /accounts HTTP endpoint.
 */
function AccountService($http, util, Session) {
  var service = this;
  var baseUrl = '/accounts/';

  service.read = read;
  service.label = label;

  service.getBalance = getBalance;
  service.getChildren = getChildren;

  service.flatten = flatten;
  service.order = order;
  service.create = create;
  service.update = update;
  service.delete = del;

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
      .then(function (accounts) {

        // if we received an array of accounts from the server,
        // label the accounts with a nice human readable label
        if (angular.isArray(accounts)) {
          accounts.forEach(function (account) {
            account.hrlabel = label(account);
          });
        }

        return accounts;
      });
  }

  function getBalance(account_id, opt){
    var url = baseUrl + account_id + '/balance';
    return $http.get(url, opt)
      .then(util.unwrapHttpResponse);
  }

  function label(account) {
    return account.number + ' - ' + account.label;
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
    children = accounts.filter(function (account) {
      return account.parent === parentId;
    });

    // recursively call getChildren on all child accounts
    // and attach them as childen of their parent account
    children.forEach(function (account) {
      account.children = getChildren(accounts, account.id);
    });

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
  function flatten(tree, depth) {
    depth = isNaN(depth) ? -1 : depth;
    depth += 1;

    return tree.reduce(function (array, node) {
      node.$$treeLevel = depth;

      var items = [node].concat(node.children ? flatten(node.children, depth) : []);
      return array.concat(items);
    }, []);
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

  /**
   * @helper
   * This Method Creat an account
   */
  function create(account) {
    return $http.post(baseUrl, account)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method update
   *
   * @description
   * Updates the account in the database..
   *
   * @param {Number} id - account id to update
   * @param {Object} account - account to update
   *
   * @example
   * service.update(id, account)
   * .then(function (res){
   *   // your code here
   *  });
   */
  function update(id, account) {
    return $http.put(baseUrl.concat(id), account)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @methode del an account
  * Delete the account in the Data Base
  */
  function del(accountId){
    return $http.delete(baseUrl.concat(accountId))
    .then(util.unwrapHttpResponse);
  }

  return service;
}

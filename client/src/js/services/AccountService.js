angular.module('bhima.services')
.service('AccountService', AccountService);

AccountService.$inject = ['$http', 'util', 'SessionService'];

/**
* Account Service
*
* A service wrapper for the /accounts HTTP endpoint.
*/
function AccountService($http, util, sessionService) {
  var service = this;
  var baseUrl = '/accounts/';

  service.read = read;
  service.label = label;

  /** @deprecated */
  service.list = list;

  service.getBalance = getBalance;
  service.getChildren = getChildren;

  service.flatten = flatten;
  service.order = order;
  service.create = create;
  service.update = update;

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

        // label the accounts with a nice human readable label
        if (!id) {
          accounts.forEach(function (account) {
            account.label = label(account);
          });
        }

        /** @todo make this ordering work */
        // return order(accounts);
        return accounts;
      });
  }

  // return a list of accounts
  function list() {
    return $http.get('/accounts?full=1') // TODO - this should only be /accounts
      .then(util.unwrapHttpResponse)
      .then(function (accounts) {

        // hack to make sure accounts are properly rendered on cashboxes page
        // FIXME - make /accounts return the account type w/o query string
        // and preformat the numberLabel elsewhere
        accounts.forEach(function (account) {
          account.label = label(account);
        });

        return accounts;
      })
      .then(order);
  }

  function getBalance(account_id, opt){
    var url = baseUrl + account_id + '/balance';
    return $http.get(url, opt)
      .then(util.unwrapHttpResponse);
  }

  function label(account) {
    return account.account_number + ' - ' + account.account_txt;
  }

  /**
   * This method builds a tree data structure of accounts and children of a
   * specified parentId.
   *
   * @method
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
   * flattens a tree data structure (must have children property) in place.
   * @method
   */
  function flatten(tree) {
    return tree.reduce(function (array, node) {
      var items = [node].concat(node.children ? flatten(node.children) : []);
      return array.concat(items);
    }, []);
  }

  /**
   * creates a proper account ordering by first creating an account tree and then
   * flattening in place.
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
  *@helper  
  * This Method Creat an account
  **/
  function create(account) {
    var classAccount = String(account.number).charAt(0), 
      accountClean = {
        enterprise_id : sessionService.enterprise.id,
        type_id : account.type.id,
        number : account.number,
        label : account.label,
        parent : account.parent,
        locked : account.locked,
        cc_id : account.cc_id,
        pc_id : account.pc_id,
        classe : classAccount,     
        is_asset : account.is_asset,
        reference_id : account.reference_id,
        is_brut_link : account.is_brut_link,
        is_title : account.is_title,
        is_charge : account.is_charge
      };

    return $http.post(baseUrl, accountClean)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an account
  * @param {Integer} id, account id to update 
  * @param {object} account, account to update 
  * @example
  * service.update(id, account)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, account) {
    var accountClean = {
      enterprise_id : sessionService.enterprise.id,
      type_id : account.type_id,
      label : account.title,
      parent : account.parent,
      locked : account.locked,
      cc_id : account.cc_id,
      pc_id : account.pc_id,     
      is_asset : account.is_asset,
      reference_id : account.reference_id,
      is_brut_link : account.is_brut_link,
      is_title : account.is_title,
      is_charge : account.is_charge
    };

    return $http.put(baseUrl.concat(id), accountClean)
      .then(util.unwrapHttpResponse);
  }

  return service;
}

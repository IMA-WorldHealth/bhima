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

  service.list = list;
  service.getBalance = getBalance;
  service.getChildren = getChildren;
  service.flatten = flatten;
  service.order = order;
  service.getAccountType = getAccountType;
  service.create = create;
  service.update = update;

  // return a list of accounts
  function list() {
    return $http.get('/accounts?full=1') // TODO - this should only be /accounts
      .then(util.unwrapHttpResponse)
      .then(function (accounts) {
        // hack to make sure accounts are properly rendered on cashboxes page
        // FIXME - make /accounts return the account type w/o query string
        // and preformat the label elsewhere
        accounts.forEach(function (account) {
          account.label = account.account_number + ' - ' + account.account_txt;
        });

        return accounts;
      })
      .then(order);
  }

  function getBalance(account_id, opt){
    var url = baseUrl + '/' + account_id + '/balance';
    return $http.get(url, opt)
      .then(util.unwrapHttpResponse);
  }

  /** @helper
  *This method builds a tree data structure of
  *accounts and children of a specified parentId.
  **/
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
  *@helper
  *flattens a tree data structure (must have children property) in place.
  **/
  function flatten(tree) {
    return tree.reduce(function (array, node) {
      var items = [node].concat(node.children ? flatten(node.children) : []);
      return array.concat(items);
    }, []);
  }

  /**
  *creates a proper account ordering by first creating an account tree and then
  * flattening in place.
  **/
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
  * This Method return a list of Account Type
  **/
  function getAccountType(id, params) {
     return $http.get('/account_types', { params : params })
     .then(util.unwrapHttpResponse);
  }

  /**
  *@helper  
  * This Method Creat an account
  **/
  function create(account) {
    var classAccount = String(account.account_number).charAt(0), 
      accountClean = {
        enterprise_id : sessionService.enterprise.id,
        account_type_id : account.type.id,
        account_number : account.account_number,
        account_txt : account.title,
        parent : account.parent,
        locked : account.locked,
        cc_id : account.cc_id,
        pc_id : account.pc_id,
        classe : classAccount,     
        is_asset : account.is_asset,
        reference_id : account.reference_id,
        is_brut_link : account.is_brut_link,
        is_used_budget : account.is_used_budget,
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
      account_type_id : account.account_type_id,
      account_txt : account.title,
      parent : account.parent,
      locked : account.locked,
      cc_id : account.cc_id,
      pc_id : account.pc_id,     
      is_asset : account.is_asset,
      reference_id : account.reference_id,
      is_brut_link : account.is_brut_link,
      is_used_budget : account.is_used_budget,
      is_title : account.is_title,
      is_charge : account.is_charge
    };

    return $http.put(baseUrl.concat(id), accountClean)
      .then(util.unwrapHttpResponse);
  }

  return service;
}

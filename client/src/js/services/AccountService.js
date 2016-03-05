angular.module('bhima.services')
.service('AccountService', AccountService);

AccountService.$inject = ['$http', 'util'];

/**
* Account Service
*
* A service wrapper for the /accounts HTTP endpoint.  
*/
function AccountService($http, util) {
  var service = this;
  var baseUrl = '/accounts';

  service.list = list;
  service.getBalance = getBalance;
  service.getChildren = getChildren;
  service.flatten = flatten;
  service.order = order;


  // return a list of accounts
  function list() {
    return $http.get('/accounts?full=1') // TODO - this should only be /accounts
      .then(util.unwrapHttpResponse)
      .then(function (accounts) {
        
        // hack to make sure accounts are properly rendered on cashboxes page
        // FIXME - make /accounts return the account type w/o query string
        // and preformat the label elsewhere
        accounts.forEach(function (account) {
          account.label = account.account_number + ' ' + account.account_txt;
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

  return service;
}

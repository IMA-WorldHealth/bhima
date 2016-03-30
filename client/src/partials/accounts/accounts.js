// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  'AccountService', 'CostCenterService', 'ProfitCenterService', 'ReferenceService', 'AccountTypeService'
];

function AccountsController(accountService, costCenterService, profitCenterService, referenceService, accountTypeService) {
  var vm = this;
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.dataByTypes = dataByTypes;
  vm.typeAccount = typeAccount;
  vm.discareCC = discareCC;
  vm.discarePC = discarePC;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load Account Type
    accountTypeService.getAccountType().then(function (data) {
      vm.accountTypes = data;
    }).catch(handler);

    // load Cost Center
    costCenterService.read().then(function (data) {
      vm.costCenters = data;
    }).catch(handler);

    // load Profit Center
    profitCenterService.read().then(function (data) {
      vm.profitCenters = data;
    }).catch(handler);

    // load Reference
    referenceService.read().then(function (data) {
      vm.references = data;
    }).catch(handler);

    // load accounts
    refreshAccounts();
  }

  function cancel() {
    vm.view = 'default';
  }
  
  //This function cancels the information that should not exist 
  //in the event of one or another type of accounts (balance or income/expense)  
  function dataByTypes(){
    if(vm.account.type.type === 'balance'){
      vm.account.is_charge = null;
      vm.account.cc_id = null;
      vm.account.pc_id = null;
    } else if (vm.account.type.type === 'income/expense'){
      vm.account.is_asset = null;
    }
  }

  //This function first looks up the name type of account with the ID 
  //and then cancels the information that should not exist in the event of one 
  //or another type of accounts (balance or operating account)
  function typeAccount(typeId, accountTypes){
    vm.account.type = accountTypeService.getTypeText(typeId, accountTypes);

    if(vm.account.type === 'balance'){
      vm.account.is_charge = null;
      vm.account.cc_id = null;
      vm.account.pc_id = null;
    } else if (vm.account.type === 'income/expense'){
      vm.account.is_asset = null;
    }
  }

  function discareCC() {
    vm.account.cc_id = null;
  };

  function discarePC() {
    vm.account.pc_id = null;
  };

  function create() {
    vm.view = 'create';
    vm.account = { 
      is_title : 0,
      parent : 0,
      locked : 0 
    };    
  }

  // switch to update mode
  // data is an object that contains all the information of a account
  function update(data) {
    data.title = data.label;
    vm.view = 'update';
    vm.account = data;
  }

  
  // refresh the displayed Accounts
  function refreshAccounts() {
    return accountService.list().then(function (data) {
      vm.accounts = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    var account = angular.copy(vm.account);
    
    promise = (creation) ?
      accountService.create(account) :
      accountService.update(account.id, account);

    promise
      .then(function (response) {
        return refreshAccounts();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}
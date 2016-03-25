angular.module('bhima.controllers')
.controller('BillingServicesListController', BillingServicesListController);

BillingServicesListController.$inject = [
  '$translate', 'BillingServicesService', 'AccountService'
];

/**
 * The Billing Services Controller
 *
 * This is the default controller for the billing services URL endpoint.
 */
function BillingServicesListController($translate, BillingServices, Accounts) {
  var vm = this;

  // these options are for the ui-grid
  vm.options = {
    appScopeProvider: vm,
    enableSorting : true,
    enableHiding : false,
    columnDefs : [
      { field : 'id', name : $translate.instant('COLUMNS.ID') },
      { field : 'account', name : $translate.instant('COLUMNS.ACCOUNT') },
      { field : 'label', name : $translate.instant('COLUMNS.LABEL') },
      { field : 'description', name : $translate.instant('COLUMNS.DESCRIPTION') },
      { field : 'value', name : $translate.instant('COLUMNS.VALUE') },
      { field : 'created_at', name : $translate.instant('COLUMNS.DATE'), cellFilter:'date' },
    ]
  };

  // default loading state - false;
  vm.loading = false;

  // fired on state init
  function startup() {

    // turn the loading indicator on
    toggleLoadingIndicator();

    // retrieve a detailed list of the billing services in the application
    BillingServices.read(null, { detailed : 1 })
    .then(function (billingServices) {

      // make a pretty human readable account label
      billingServices.forEach(function (service) {
        service.account = Accounts.label(service);
      });

      // populate the grid
      vm.options.data = billingServices;
    })
    .catch(function (error) {
      vm.error = error;
    })
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  startup();
}

angular.module('bhima.controllers')
.controller('BillingServicesController', BillingServicesController);

BillingServicesController.$inject = [
  '$state', '$translate', 'BillingServicesService'
];

/**
 * The Billing Services Controller
 *
 * This is the default controller for the billing services URL endpoint.
 */
function BillingServicesController($state, $translate, BillingServices) {
  var vm = this;

  // these options are for the ui-grid
  vm.options = {
    appScopeProvider: vm,
    enableSorting : true,
    enableHiding : false,
    columnDefs : [
      { field : 'id', name : $translate.instant('COLUMNS.ID') },
      { field : 'account_id', name : $translate.instant('COLUMNS.ACCOUNT') },
      { field : 'label', name : $translate.instant('COLUMNS.LABEL') },
      { field : 'description', name : $translate.instant('COLUMNS.DESCRIPTION') },
      { field : 'value', name : $translate.instant('COLUMNS.VALUE') },
      { field : 'date', name : $translate.instant('COLUMNS.DATE'), cellFilter:'date' },
    ]
  };

  // default loading state - false;
  vm.loading = false;

  vm.update = update;

  // fired on state init
  function startup() {

    // turn the loading indicator on
    toggleLoadingIndicator();

    // retrieve a detailed list of the billing services in the application
    BillingServices.read(null, { detailed : 1 })
    .then(function (billingServices) {
      console.log('loaded:', billingServices);
      vm.options.data = billingServices;
    })
    .finally(function () {

      // turn loading indicator off after HTTP request is finished
      toggleLoadingIndicator();
    });
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // update the clicked billing service
  function update(id) {
    console.log('clicked:', id);
    //$state.go('billingServices.update');
  }

  startup();
}

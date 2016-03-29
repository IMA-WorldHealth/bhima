angular.module('bhima.controllers')
.controller('BillingServicesController', BillingServicesController);

BillingServicesController.$inject = [
  '$state', '$stateParams', '$translate', 'BillingServicesService', 'AccountService'
];

/**
 * The Billing Services Controller
 *
 * This is the default controller for the billing services URL endpoint.  It
 * downloads and displays all billing services in the application via a ui-grid.
 */
function BillingServicesController($state, $params, $translate, BillingServices, Accounts) {
  var vm = this;

  var updateTemplate =
    'partials/billing_services/templates/update.button.html';

  var deleteTemplate =
    'partials/billing_services/templates/delete.button.html';

  // these options are for the ui-grid
  vm.options = {
    appScopeProvider: vm,
    enableSorting : true,
    enableColumnMenus: false,
    onRegisterApi: registerGridApi,
    columnDefs : [{
      field : 'id',
      displayName : $translate.instant('COLUMNS.ID'),
      width: 45
    }, {
      field : 'account',
      displayName : $translate.instant('COLUMNS.ACCOUNT'),
      width: '*'
    }, {
      field : 'label',
      displayName : $translate.instant('COLUMNS.LABEL')
    }, {
      field : 'description',
      displayName: $translate.instant('COLUMNS.DESCRIPTION')
    }, {
      field : 'value',
      displayName : $translate.instant('COLUMNS.VALUE'),
      cellFilter:'percentage',
      cellClass: 'text-right'
    }, {
      field : 'created_at',
      displayName : $translate.instant('COLUMNS.DATE'),
      cellFilter:'date',
      cellClass: 'text-center'
    }, {
      field : 'edit',
      displayName: '',
      cellTemplate : updateTemplate,
      width: 45
    }, {
      field : 'delete',
      displayName : '',
      cellTemplate: deleteTemplate,
      width: 45
    }]
  };

  // bind state service to hide state buttons
  vm.$state = $state;

  function registerGridApi(api) {
    vm.api = api;
  }

  // default loading state - false;
  vm.loading = false;

  // HTTP error handler - binds error to view
  function handler(response) {
    vm.error = response.data;
  }

  /**
   * scrolls to a particular row in the view
   */
  function scrollToId(id) {

    // find the matching row in the data
    var target;
    vm.options.data.forEach(function (row) {
      if (row.id === id) { target = row; }
    });

    // scroll to the given row into view
    vm.api.core.scrollTo(target, vm.options.columnDefs[0]);
  }

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

      // scroll to the indicated id in the grid an id was passed in
      if ($state.params.id) {
        scrollToId($state.params.id);
      }
    })
    .catch(handler)
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  // toggle the grid's loading indicator
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  startup();
}

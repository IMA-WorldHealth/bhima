angular.module('bhima.controllers')
.controller('BillingServicesController', BillingServicesController);

BillingServicesController.$inject = [
  '$state', 'BillingServicesService', 'AccountService', 'NotifyService'
];

/**
 * The Billing Services Controller
 *
 * This is the default controller for the billing services URL endpoint.  It
 * downloads and displays all billing services in the application via a ui-grid.
 */
function BillingServicesController($state, BillingServices, Accounts, Notify) {
  var vm = this;

  var actionsTemplate =
    'partials/billing_services/templates/actions.link.html';

  // these options are for the ui-grid
  vm.options = {
    appScopeProvider: vm,
    enableSorting : true,
    enableColumnMenus: false,
    onRegisterApi: registerGridApi,
    columnDefs : [{
      field : 'id',
      displayName : 'TABLE.COLUMNS.ID',
      headerCellFilter: 'translate',
      width: 45
    }, {
      field : 'account',
      displayName : 'TABLE.COLUMNS.ACCOUNT',
      headerCellFilter: 'translate',
      width: '*'
    }, {
      field : 'label',
      displayName : 'TABLE.COLUMNS.LABEL',
      headerCellFilter: 'translate',
    }, {
      field : 'description',
      displayName: 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter: 'translate',
    }, {
      field : 'value',
      displayName : 'TABLE.COLUMNS.VALUE',
      headerCellFilter: 'translate',
      cellFilter:'percentage',
      cellClass: 'text-right'
    }, {
      field : 'created_at',
      displayName : 'TABLE.COLUMNS.DATE',
      headerCellFilter: 'translate',
      cellFilter:'date',
    }, {
      field : 'actions',
      displayName: '...',
      cellTemplate : actionsTemplate
    }]
  };

  // bind state service to hide state buttons
  vm.$state = $state;

  // default loading state - false;
  vm.loading = false;


  function registerGridApi(api) {
    vm.api = api;
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
      .catch(Notify.handleError)
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

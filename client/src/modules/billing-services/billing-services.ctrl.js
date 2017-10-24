angular.module('bhima.controllers')
  .controller('BillingServicesController', BillingServicesController);

BillingServicesController.$inject = [
  '$state', 'BillingServicesService', 'NotifyService', 'bhConstants', '$timeout', 'uiGridConstants',
];

/**
 * The Billing Services Controller
 *
 * This is the default controller for the billing services URL endpoint.  It
 * downloads and displays all billing services in the application via a ui-grid.
 */
function BillingServicesController($state, BillingServices, Notify, bhConstants, $timeout, uiGridConstants) {
  var vm = this;

  var actionTemplate =
    'modules/billing-services/templates/action.cell.html';

  var columns;

  vm.ROW_HIGHLIGHT_FLAG = bhConstants.grid.ROW_HIGHLIGHT_FLAG;
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;

  columns = [{
    field : 'id',
    displayName : 'TABLE.COLUMNS.ID',
    headerCellFilter: 'translate',
    width: 45,
  }, {
    field : 'account',
    displayName : 'TABLE.COLUMNS.ACCOUNT',
    headerCellFilter: 'translate',
    width: '*',
  }, {
    field : 'label',
    displayName : 'TABLE.COLUMNS.LABEL',
    headerCellFilter: 'translate',
  }, {
    field: 'description',
    displayName: 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter:'translate',
  }, {
    field : 'value',
    displayName : 'TABLE.COLUMNS.VALUE',
    headerCellFilter: 'translate',
    cellFilter:'percentage',
    cellClass: 'text-right',
  }, {
    field : 'created_at',
    displayName : 'TABLE.COLUMNS.DATE',
    headerCellFilter: 'translate',
    cellFilter:'date',
  }, {
    field : 'action',
    displayName: '',
    enableSorting : false,
    cellTemplate : actionTemplate,
  }];

  // these options are for the ui-grid
  vm.options = {
    appScopeProvider: vm,
    enableSorting : true,
    flatEntityAccess  : true,
    enableColumnMenus: false,
    onRegisterApi: registerGridApi,
    rowTemplate: '/modules/templates/grid/highlight.row.html',
    columnDefs :  columns,
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
   * Also highlights the row to draw attention to itself
   */
  function scrollToId(id) {
    var rows = vm.api.grid.rows;

    // find the matching row in the data
    var target;
    rows.forEach(function (row) {
      if (row.entity.id === id) { target = row; }
    });

    target[vm.ROW_HIGHLIGHT_FLAG] = true;

    // scroll to the given row into view
    vm.api.core.scrollTo(target, vm.options.columnDefs[0]);
  }

  // fired on state init
  function startup() {
    toggleLoadingIndicator();

    // retrieve a detailed list of the billing services in the application
    BillingServices.read(null, { detailed : 1 })
      .then(function (billingServices) {

        // make a pretty human readable account label
        // TODO(@jniles) - make this use the account_label.  Requires changing
        // the server
        billingServices.forEach(function (service) {
          service.account = service.number;
        });

        // populate the grid
        vm.options.data = billingServices;

        // scroll to the indicated id in the grid an id was passed in
        if ($state.params.id) {
          $timeout(function () { scrollToId($state.params.id); });
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

  // toggle inline filtering
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.options.enableFiltering = vm.filterEnabled;
    vm.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  startup();
}

angular.module('bhima.controllers')
  .controller('DistributionKeyController', DistributionKeyController);

DistributionKeyController.$inject = [
  'DistributionCenterService', 'NotifyService', 'uiGridConstants',
  'GridGroupingService', 'uiGridGroupingConstants',
];

/**
 * Update Distribution Center Controller
 *
 * This controller is about the updating Distribution Center module in the Finance zone
 * It's responsible for editing and updating a Distribution Center
 */
function DistributionKeyController(DistributionCenters, Notify, uiGridConstants,
  Grouping, uiGridGroupingConstants) {
  const vm = this;

  // bind methods
  vm.toggleFilter = toggleFilter;
  vm.settings = settings;

  // global variables
  vm.gridApi = {};
  vm.loading = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    showColumnFooter  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    showGridFooter : true,
    gridFooterTemplate : 'modules/distribution_center/templates/footer.template.html',

    columnDefs : [{
      field : 'auxiliary_label',
      displayName : 'TABLE.COLUMNS.AUXILIARY_CENTER',
      headerCellFilter : 'translate',
    }, {
      field : 'principal_label',
      displayName : 'TABLE.COLUMNS.PRINCIPAL_CENTER',
      headerCellFilter : 'translate',
    }, {
      field : 'rate',
      displayName : 'TABLE.COLUMNS.RATE',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/distribution_center/templates/rate.tmp.html',
      treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    }, {
      field : 'user_name',
      displayName : 'TABLE.COLUMNS.RESPONSIBLE',
      headerCellFilter : 'translate',
      enableFiltering : true,
    }, {
      field : 'action',
      width : 120,
      displayName : '',
      cellTemplate : '/modules/distribution_center/templates/setting.tmpl.html',
      enableSorting : false,
      enableFiltering : false,
    }],
  };

  vm.grouping = new Grouping(vm.gridOptions, true, 'auxiliary_label', vm.grouped, true);

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // settings distribution keys
  function settings(distributions) {
    const dataSettings = distributions[0].row.entity;
    const settingsValues = [];

    distributions.forEach(item => {
      settingsValues.push({
        auxiliary_fee_center_id : item.row.entity.auxiliary_fee_center_id,
        principal_fee_center_id : item.row.entity.principal_fee_center_id,
        rate : item.row.entity.rate,
      });
    });

    dataSettings.settingsValues = settingsValues;

    DistributionCenters.openDistributionKeyModal(dataSettings)
      .then((changes) => {
        if (changes) {
          load();
        }
      });
  }

  function load() {
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    DistributionCenters.getDistributionKey()
      .then((data) => {
        vm.gridOptions.data = data;
      })
      .catch(errorHandler)
      .finally(toggleLoadingIndicator);
  }

  /**
   * @function toggleLoadingIndicator
   *
   * @description
   * Toggles the grid's loading indicator to eliminate the flash when rendering
   * transactions and allow a better UX for slow loads.
   */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /**
   * @function errorHandler
   *
   * @description
   * Uses Notify to show an error in case the server sends back an information.
   * Triggers the error state on the grid.
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  load();
}

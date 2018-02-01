angular.module('bhima.controllers')
  .controller('IprTaxConfigurationController', IprTaxConfigurationController);

IprTaxConfigurationController.$inject = [
  'IprTaxConfigService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * IprTax Configuration Controller
 *
 * This controller is about the IprTax configuration module in the admin zone
 * It's responsible for creating, editing and updating a IprTax
 */
function IprTaxConfigurationController(
  IprTaxes, ModalService,
  Notify, uiGridConstants, $state, Session
) {
  var vm = this;

  // bind methods
  vm.deleteIprTax = deleteIprTax;
  vm.editIprTaxConfig = editIprTaxConfig;
  vm.toggleFilter = toggleFilter;
  vm.iprScaleSelect = iprScaleSelect;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'rate', displayName : 'FORM.LABELS.RATE', headerCellFilter : 'translate', width : 60, cellTemplate : '/modules/ipr_tax/templates/rate.tmpl.html',},
      {
        field : 'tranche_annuelle_debut', displayName : 'FORM.LABELS.ANNUAL_TRANCH_FROM', headerCellFilter : 'translate', width : 170, cellTemplate : '/modules/ipr_tax/templates/tranche_annuelle_debut.tmpl.html',
      },
      {
        field : 'tranche_annuelle_fin', displayName : 'FORM.LABELS.ANNUAL_TRANCH_TO', headerCellFilter : 'translate', width : 170, cellTemplate : '/modules/ipr_tax/templates/tranche_annuelle_fin.tmpl.html',
      },
      {
        field : 'tranche_mensuelle_debut', displayName : 'FORM.LABELS.MONTH_TRANCH_FROM', headerCellFilter : 'translate', width : 170, cellTemplate : '/modules/ipr_tax/templates/tranche_mensuelle_debut.tmpl.html',
      },
      {
        field : 'tranche_mensuelle_fin', displayName : 'FORM.LABELS.MONTH_TRANCH_TO', headerCellFilter : 'translate', width : 170, cellTemplate : '/modules/ipr_tax/templates/tranche_mensuelle_fin.tmpl.html',
      },
      { field : 'ecart_annuel', displayName : 'FORM.LABELS.ANNUAL_ECART', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/ecart_annuel.tmpl.html', },
      { field : 'ecart_mensuel', displayName : 'FORM.LABELS.MONTH_ECART', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/ecart_mensuel.tmpl.html', },
      { field : 'impot_annuel', displayName : 'FORM.LABELS.ANNUAL_IMPOT', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/impot_annuel.tmpl.html', },
      { field : 'impot_mensuel', displayName : 'FORM.LABELS.MONTH_IMPOT', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/impot_mensuel.tmpl.html', },
      { field : 'cumul_annuel', displayName : 'FORM.LABELS.ANNUAL_CUMUL', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/cumul_annuel.tmpl.html', },
      { field : 'cumul_mensuel', displayName : 'FORM.LABELS.MONTH_CUMUL', headerCellFilter : 'translate', cellTemplate : '/modules/ipr_tax/templates/cumul_mensuel.tmpl.html', },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/ipr_tax/templates/actionConfig.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : gridColumn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function iprScaleSelect(scaleId) {
    vm.taxIprId = scaleId;

    // FIX ME
    // Load IPR taxes scale only if scale Id is defined 
    if (vm.taxIprId) {
      loadIprTaxes();
    }
  }

  function loadIprTaxes() {
    vm.loading = true;

    IprTaxes.read(null, { taxe_ipr_id : vm.taxIprId })
      .then(function (data) {
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteIprTax(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(function (bool) {
        if (!bool) { return; }

        IprTaxes.delete(title.id)
          .then(function () {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadIprTaxes();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing IprTaxConfig
  function editIprTaxConfig(ipr) {
    $state.go('configuration.editConfig', { taxIprId : vm.taxIprId, id : ipr.id });
  }

  iprScaleSelect();
}

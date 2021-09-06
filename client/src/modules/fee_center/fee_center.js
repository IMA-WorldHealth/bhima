angular.module('bhima.controllers')
  .controller('feeCenterController', feeCenterController);

feeCenterController.$inject = [
  'FeeCenterService', 'ModalService', 'NotifyService', 'uiGridConstants', '$translate',
];

/**
 * Fee Center Controller
 *
 * This controller is about the Fee Center module in the admin zone
 * It's responsible for creating, editing and updating a Fee Center
 */
function feeCenterController(FeeCenters, ModalService, Notify, uiGridConstants, $translate) {
  const vm = this;

  // bind methods
  vm.deleteFeeCenter = deleteFeeCenter;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'label',
        displayName : 'FORM.LABELS.DESIGNATION',
        headerCellFilter : 'translate',
      },
      {
        field : 'abbrs',
        displayName : 'FORM.LABELS.REFERENCE',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'projectName',
        displayName : 'FORM.LABELS.PROJECT',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'serviceNames',
        displayName : 'FORM.LABELS.SERVICES',
        headerCellFilter : 'translate',
        visible : true,
      },
      {
        field : 'is_principal',
        displayName : '',
        headerCellFilter : 'translate',
        enableFiltering : false,
        enableSorting : true,
        cellTemplate : '/modules/fee_center/templates/feeCenterType.tmpl.html',
      },
      {
        field : 'allocation_method',
        displayName : 'FORM.LABELS.ALLOCATION_METHOD',
        headerToolTip : 'FORM.LABELS.ALLOCATION_METHOD_TOOLTIP',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        visible : true,
        cellTemplate : '/modules/fee_center/templates/allocationBasis.tmpl.html',
      },
      {
        field : 'allocation_basis_name',
        displayName : 'FORM.LABELS.ALLOCATION_BASIS',
        headerCellFilter : 'translate',
        headerCellClass : 'allocationBasisColHeader',
        visible : true,
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/fee_center/templates/action.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function isTranslationToken(str) {
    const repat = /[A-Z_]+/;
    return repat.test(str);
  }

  function loadFeeCenters() {
    vm.loading = true;

    FeeCenters.getAllocationBases()
      .then((bases) => {
        // Translate the basis terms, if possible
        bases.forEach(base => {
          if (isTranslationToken(base.name)) {
            base.name = $translate.instant(`FORM.LABELS.${base.name}`);
          }
          if (isTranslationToken(base.description)) {
            base.description = $translate.instant(`FORM.LABELS.${base.description}`);
          }
        });
        vm.allocationBases = bases;
      })
      .catch(Notify.handleError);

    FeeCenters.read()
      .then((data) => {
        data.forEach(fc => {
          if (isTranslationToken(fc.allocation_basis_name)) {
            fc.allocation_basis_name = $translate.instant(`FORM.LABELS.${fc.allocation_basis_name}`)
          }
        });
        vm.gridOptions.data = data;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteFeeCenter(feeCenter) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then((bool) => {
        if (!bool) { return; }

        FeeCenters.delete(feeCenter.id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadFeeCenters();
          })
          .catch(Notify.handleError);
      });
  }

  loadFeeCenters();
}

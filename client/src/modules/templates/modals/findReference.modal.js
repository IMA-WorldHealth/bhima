angular.module('bhima.controllers')
  .controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$uibModalInstance', 'VoucherService', 'CashService', 'GridFilteringService',
  'entity', 'PatientInvoiceService', 'uiGridConstants', 'NotifyService'
];

/**
 * Find Reference Modal Controller
 *
 * This controller provides bindings for the find references modal.
 * @todo Implement the Cash Payment Data list for the references
 */
function FindReferenceModalController(Instance, Voucher, Cash, Filtering, Entity, Invoices, uiGridConstants, Notify) {
  var vm = this;

  vm.result = {};

  vm.loading = false;

  vm.documentType = {
    'patient_invoice' : {
      label : 'VOUCHERS.COMPLEX.PATIENT_INVOICE',
      action : referencePatientInvoice
    },
    'cash_payment' : {
      label : 'VOUCHERS.COMPLEX.CASH_PAYMENT',
      action : referenceCashPayment
    },
    'voucher' : {
      label : 'VOUCHERS.COMPLEX.VOUCHER',
      action : referenceVoucher
    }
  };

  vm.selectDocType = selectDocType;
  vm.submit  = submit;
  vm.cancel  = cancel;
  vm.refresh = refresh;

  /* ======================= Grid configurations ============================ */
  vm.filterEnabled = false;
  vm.gridOptions = {};

  var filtering  = new Filtering(vm.gridOptions);

  vm.gridOptions.multiSelect     = false;
  vm.gridOptions.enableFiltering = vm.filterEnabled;
  vm.gridOptions.onRegisterApi   = onRegisterApi;
  vm.toggleFilter = toggleFilter;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  function rowSelectionCallback(row) {
    vm.selectedRow = row.entity;

    // update to selected document type
    vm.selectedRow.document_type = vm.documentTypeLabel;
  }

  /** toggle filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }
  /* ======================= End Grid configurations ======================== */

  // startup the modal
  startup();

  function referencePatientInvoice() {
    toggleLoadingIndicator();

    Invoices.read()
      .then(function (list) {
        var costTemplate =
          '<div class="ui-grid-cell-contents text-right">' +
            '{{ row.entity.cost | currency: grid.appScope.enterprise.currency_id }}' +
          '</div>';

        vm.gridOptions.columnDefs = [
          { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
          {
            field : 'date',
            cellFilter:'date',
            filter : { condition : filtering.byDate },
            displayName : 'TABLE.COLUMNS.BILLING_DATE',
            headerCellFilter : 'translate',
            sort : { priority : 0, direction : 'desc'}
          },
          { field : 'patientNames', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
          { field : 'cost', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate', cellTemplate: costTemplate },
          { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
          { field : 'display_name', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' }
        ];

        vm.gridOptions.data = list;
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function referenceCashPayment() {
    toggleLoadingIndicator();

    Cash.read()
      .then(function (list) {
        var costTemplate =
          '<div class="ui-grid-cell-contents text-right">' +
            '{{ row.entity.amount | currency: grid.appScope.enterprise.currency_id }}' +
          '</div>';

        vm.gridOptions.columnDefs = [
          { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
          {
            field : 'date',
            cellFilter:'date',
            filter : { condition : filtering.byDate },
            displayName : 'TABLE.COLUMNS.BILLING_DATE',
            headerCellFilter : 'translate',
            sort : { priority : 0, direction : 'desc'}
          },
          { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter : 'translate' },
          { field : 'amount', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate', cellTemplate: costTemplate }
        ];

        vm.gridOptions.data = list;
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function referenceVoucher() {
    toggleLoadingIndicator();

    Voucher.read()
      .then(function (list) {
        var amountTemplate =
          '<div class="ui-grid-cell-contents text-right">' +
            '{{ row.entity.amount | currency: grid.appScope.enterprise.currency_id }}' +
          '</div>';

        vm.gridOptions.columnDefs  = [
          { field : 'reference', displayName : 'Reference'},
          {
            field : 'date',
            displayName : 'Date',
            cellFilter : 'date:"mediumDate"',
            filter : { condition : filtering.byDate },
            sort : { priority : 0, direction : 'desc'}
          },
          { field : 'description', displayName : 'Description'},
          { field : 'amount', displayName : 'Amount', cellTemplate: amountTemplate }
        ];

        // format data for the grid
        var data = list.map(function (item) {
          return {
            uuid          : item.uuid,
            reference     : item.reference,
            date          : item.date,
            description   : item.description,
            amount        : item.amount
          };
        });
        vm.gridOptions.data = data;
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function selectDocType(type) {
    vm.documentTypeLabel = vm.documentType[type].label;
    vm.documentType[type].action();
    vm.documentTypeSelected = true;
  }

  function refresh() {
    vm.documentTypeSelected = false;
  }

  function submit() {
    Instance.close(vm.selectedRow);
  }

  function cancel() {
    Instance.dismiss('cancel');
  }

  function startup() {
    vm.selectedEntity = Entity || {};
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }
}

angular.module('bhima.controllers')
  .controller('FindReferenceModalController', FindReferenceModalController);

FindReferenceModalController.$inject = [
  '$uibModalInstance', 'VoucherService', 'CashService', 'GridFilteringService',
  'entity', 'PatientInvoiceService', 'uiGridConstants', 'NotifyService',
  'bhConstants', 'SessionService',
];

/**
 * Find Reference Modal Controller
 *
 * @description
 * This controller provides bindings for the find references modal.
 *
 * TODO(@jniles) - rewrite this entire file.  There is no need to use objects,
 * just call the methods from the HTML itself.
 */
function FindReferenceModalController(
  Instance, Voucher, Cash, GridFilter, entity, Invoices, uiGridConstants,
  Notify, bhConstants, Session
) {
  var vm = this;
  var filtering;
  var SHARED_COLUMN_DEFNS;
  var DEFAULT_DOWNLOAD_LIMIT = 250;
  vm.DEFAULT_DOWNLOAD_LIMIT = DEFAULT_DOWNLOAD_LIMIT;

  vm.result = {};

  vm.loading = false;

  vm.documentType = {
    patient_invoice : {
      label : 'VOUCHERS.COMPLEX.PATIENT_INVOICE',
      action : referencePatientInvoice,
    },
    cash_payment : {
      label : 'VOUCHERS.COMPLEX.CASH_PAYMENT',
      action : referenceCashPayment,
    },
    voucher : {
      label : 'VOUCHERS.COMPLEX.VOUCHER',
      action : referenceVoucher,
    },
  };

  vm.selectDocType = selectDocType;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.refresh = refresh;
  vm.showAllRecords = showAllRecords;

  /* ======================= Grid configurations ============================ */

  // TODO - make this a default options extensible by many different
  vm.gridOptions = {};

  vm.gridOptions.multiSelect = false;
  vm.gridOptions.enableFiltering = false;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.gridOptions.fastWatch = true;
  vm.gridOptions.flatEntityAccess = true;
  vm.gridOptions.enableColumnMenus = false;

  filtering = new GridFilter(vm.gridOptions);

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // FIXME(@jniles) - by some quirk of UI grid, this doesn't work.
  vm.toggleInlineFilter = function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  /* ======================= End Grid configurations ======================== */

  // startup the modal
  startup();

  SHARED_COLUMN_DEFNS = [{
    field : 'reference',
    displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter : 'translate',
  }, {
    field : 'date',
    cellFilter : 'date:"'.concat(bhConstants.dates.format, '"'),
    filter : { condition : filtering.filterByDate },
    displayName : 'TABLE.COLUMNS.DATE',
    headerCellFilter : 'translate',
    sort : { priority : 0, direction : 'desc' },
  }, {
    field : 'amount',
    displayName : 'TABLE.COLUMNS.COST',
    headerCellFilter : 'translate',
    cellFilter: 'currency:'.concat(Session.enterprise.currency_id),
    cellClass : 'text-right',
  }];

  // this function extends the columns list by splicing in the accounts
  // at the second position.
  function substitute(columns) {
    var cloned = SHARED_COLUMN_DEFNS.slice();
    Array.prototype.splice.apply(cloned, [1, 0].concat(columns));
    return cloned;
  }

  function referencePatientInvoice(limit) {
    toggleLoadingIndicator();

    Invoices.read(null, { limit : limit })
      .then(function (list) {
        vm.gridOptions.columnDefs = substitute([
          { field : 'patientName', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
          { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate' },
          { field : 'display_name', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
        ]);

        // map the cost to the "amount" field
        list.forEach(function (row) {
          row.amount = row.cost;
        });

        vm.gridOptions.data = list;

        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function referenceCashPayment(limit) {
    toggleLoadingIndicator();

    Cash.read(null, { limit : limit })
      .then(function (list) {
        vm.gridOptions.columnDefs = substitute([
          { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter : 'translate' },
        ]);

        vm.gridOptions.data = list;
        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }

  function referenceVoucher(limit) {
    toggleLoadingIndicator();

    Voucher.read(null, { limit : limit })
      .then(function (list) {
        vm.gridOptions.columnDefs = substitute([
          { field : 'description', displayName : 'TABLE.COLUMNS.DESCRIPTION', headerCellFilter : 'translate' },
        ]);

        // format data for the grid
        var data = list.map(function (item) {
          return {
            uuid          : item.uuid,
            reference     : item.reference,
            date          : item.date,
            description   : item.description,
            amount        : item.amount,
          };
        });

        vm.gridOptions.data = data;

        vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      })
      .catch(handler)
      .finally(toggleLoadingIndicator);
  }


  function selectDocType(type) {
    vm.docType = type;
    vm.documentTypeLabel = vm.documentType[type].label;
    vm.documentType[type].action(DEFAULT_DOWNLOAD_LIMIT);
    vm.documentTypeSelected = true;
  }

  function showAllRecords() {
    // use a very, very large limit.
    vm.documentType[vm.docType].action(10000000);
  }

  function refresh() {
    vm.documentTypeSelected = false;
    vm.gridOptions.data = [];
  }

  function submit() {
    var row = vm.gridApi.selection.getSelectedRows();
    var e = row[0];
    e.document_type = vm.documentTypeLabel;
    Instance.close(e);
  }

  function cancel() {
    Instance.dismiss('cancel');
  }

  function startup() {
    vm.selectedEntity = entity || {};
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }
}

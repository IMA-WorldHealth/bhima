angular.module('bhima.controllers')
  .controller('StockFindDonationModalController', StockFindDonationModalController);

StockFindDonationModalController.$inject = [
  '$uibModalInstance', 'DonationService', 'NotifyService',
  'uiGridConstants', 'GridFilteringService', 'ReceiptModal',
  'bhConstants',
];

function StockFindDonationModalController(
  Instance, Donation, Notify,
  uiGridConstants, Filtering, Receipts, bhConstants,
) {
  const vm = this;

  // global
  vm.selectedRow = {};

  /* ======================= Grid configurations ============================ */
  vm.filterEnabled = false;
  vm.gridOptions = { appScopeProvider : vm };

  const filtering = new Filtering(vm.gridOptions);

  const columns = [
    {
      field            : 'reference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/entry/modals/templates/purchase_reference.tmpl.html',
    },

    {
      field            : 'date',
      cellFilter       : 'date:"'.concat(bhConstants.dates.format, '"'),
      filter           : { condition : filtering.filterByDate },
      displayName      : 'TABLE.COLUMNS.DATE',
      headerCellFilter : 'translate',
      sort             : { priority : 0, direction : 'desc' },
    },

    {
      field            : 'display_name',
      displayName      : 'TREE.DONOR',
      headerCellFilter : 'translate',
    },
    {
      field            : 'project_name',
      displayName      : 'FORM.LABELS.PROJECT',
      headerCellFilter : 'translate',
    },
    {
      field            : 'description',
      displayName      : 'FORM.LABELS.DESCRIPTION',
      headerCellFilter : 'translate',
    },
  ];

  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.multiSelect = false;
  vm.gridOptions.enableFiltering = vm.filterEnabled;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.toggleFilter = toggleFilter;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.showReceipt = showReceipt;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  function rowSelectionCallback(row) {
    vm.selectedRow = row.entity;
  }

  /** toggle filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /** get purchase document */
  function showReceipt(uuid) {
    Receipts.purchase(uuid);
  }

  /* ======================= End Grid ======================================== */
  function load() {
    vm.loading = true;
    Donation.read()
      .then(donations => {
        vm.gridOptions.data = donations;
      })
      .catch(() => {
        vm.hasError = true;
      })
      .finally(() => {
        vm.loading = false;
      });
  }

  // submit
  function submit() {
    if (!vm.selectedRow || (vm.selectedRow && !vm.selectedRow.uuid)) { return null; }
    return Instance.close([].concat(vm.selectedRow));
  }
  // cancel
  function cancel() {
    Instance.close();
  }

  load();
}

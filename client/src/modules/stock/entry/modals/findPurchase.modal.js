angular.module('bhima.controllers')
  .controller('StockFindPurchaseModalController', StockFindPurchaseModalController);

StockFindPurchaseModalController.$inject = [
  '$uibModalInstance', 'PurchaseOrderService', 'NotifyService',
  'uiGridConstants', 'GridFilteringService', 'bhConstants', 'SessionService',
  'ExchangeRateService',
];

function StockFindPurchaseModalController(
  Instance, Purchase, Notify, uiGridConstants, Filtering,
  bhConstants, Session, Exchange
) {
  const vm = this;

  // global
  vm.selectedRow = {};

  const {
    CONFIRMED,
    PARTIALLY_RECEIVED,
  } = bhConstants.purchaseStatus;

  /* ======================= Grid configurations ============================ */
  vm.filterEnabled = false;
  vm.gridOptions = { appScopeProvider : vm };

  const filtering = new Filtering(vm.gridOptions);

  const purchaseReferenceCellTemplate = `
    <div class="ui-grid-cell-contents">
      <bh-receipt value="row.entity.uuid" display-value="row.entity.reference" type="purchase">
    </div>
    `;
  const columns = [
    {
      field            : 'reference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate : purchaseReferenceCellTemplate,
    }, {
      field            : 'date',
      cellFilter       : `date:"${bhConstants.dates.format}"`,
      filter           : { condition : filtering.filterByDate },
      displayName      : 'TABLE.COLUMNS.DATE',
      headerCellFilter : 'translate',
      sort             : { priority : 0, direction : 'desc' },
    }, {
      field            : 'supplier',
      displayName      : 'FORM.LABELS.SUPPLIER',
      headerCellFilter : 'translate',
    }, {
      field            : 'cost',
      displayName      : 'STOCK.AMOUNT',
      headerCellFilter : 'translate',
      cellFilter       : `currency:row.entity.currency_id`,
      cellClass        : 'text-right',
    },
    { field : 'author', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
  ];

  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.multiSelect = false;
  vm.gridOptions.enableColumnMenus = false;
  vm.gridOptions.enableFiltering = vm.filterEnabled;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.toggleFilter = toggleFilter;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

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

  /* ======================= End Grid ======================================== */
  function load() {
    vm.loading = true;
    Exchange.read()
      .then(() => {
        return Purchase.search({ status_id : [CONFIRMED, PARTIALLY_RECEIVED] });
      })
      .then(purchases => {
        vm.gridOptions.data = purchases;
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

    return Purchase.stockBalance(vm.selectedRow.uuid)
      .then(handlePurchaseInformation)
      .catch(Notify.handleError);
  }

  // display the supplier name
  function handlePurchaseInformation(purchases) {
    purchases.forEach(purchase => {
      purchase.display_name = purchase.supplier_name;
    });
    Instance.close(purchases);
  }

  // cancel
  function cancel() {
    Instance.close();
  }

  load();
}

angular.module('bhima.controllers')
  .controller('StockFindTransferModalController', StockFindTransferModalController);

StockFindTransferModalController.$inject = [
  '$uibModalInstance', 'StockService', 'NotifyService', 'uiGridConstants',
  'GridFilteringService', 'data', 'bhConstants',
];

function StockFindTransferModalController(
  Instance, StockService, Notify,
  uiGridConstants, Filtering, data, bhConstants,
) {
  const vm = this;

  vm.filterReceived = false;
  vm.gridOptions = { appScopeProvider : vm };

  const filtering = new Filtering(vm.gridOptions);

  const documentReferenceTmpl = `
    <div class="ui-grid-cell-contents">
      <bh-stock-receipt
        value="row.entity.document_uuid"
        flux-id="row.entity.flux_id"
        display-value="row.entity.document_reference">
      </bh-stock-receipt>
    </div>
  `;

  const columns = [{
    field : 'status',
    displayName : 'FORM.LABELS.STATUS',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/stock/entry/modals/templates/transfer.status.tmpl.html',
  }, {
    field : 'date',
    cellFilter : `date:"${bhConstants.dates.format}"`,
    filter : { condition : filtering.filterByDate },
    displayName : 'TABLE.COLUMNS.DATE',
    headerCellFilter : 'translate',
    sort : { priority : 0, direction : 'desc' },
  }, {
    field : 'document_reference',
    displayName : 'FORM.LABELS.REFERENCE',
    headerCellFilter : 'translate',
    cellTemplate : documentReferenceTmpl,
  }, {
    field : 'depot_name',
    displayName : 'FORM.LABELS.ORIGIN',
    headerCellFilter : 'translate',
  }];

  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.multiSelect = false;
  vm.gridOptions.enableFiltering = vm.filterEnabled;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.gridOptions.enableColumnMenus = false;
  vm.gridOptions.fastWatch = true;
  vm.gridOptions.flatEntityAccess = true;

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.toggleInlineFilter = toggleInlineFilter;
  vm.toggleReceived = toggleReceived;

  vm.hasError = false;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /** toggle filter */
  function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /** toggle received */
  function toggleReceived() {
    vm.filterReceived = !vm.filterReceived;
    vm.gridOptions.data = vm.filterReceived ? vm.allTransfers : vm.pendingTransfers;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function load() {
    vm.loading = true;

    StockService.transfers.read(null, {
      depot_uuid : data.depot_uuid,
    })
      .then((transfers) => {
        // needed for receipt rendering
        transfers.forEach(transfer => {
          transfer.flux_id = bhConstants.flux.TO_OTHER_DEPOT;
        });

        vm.allTransfers = transfers;
        vm.pendingTransfers = transfers.filter(transferNotReceived);
        vm.gridOptions.data = vm.pendingTransfers;
      })
      .catch((err) => {
        vm.hasError = true;
        Notify.errorHandler(err);
      })
      .finally(() => {
        vm.loading = false;
      });
  }

  /**
   * @function tranferNotReceived
   * @description filter by not yet received
   */
  function transferNotReceived(transfer) {
    return !transfer.countedReceived;
  }

  // submit
  function submit() {
    const [selectedRow] = vm.gridApi.selection.getSelectedRows();

    if (!selectedRow) { return 0; }

    return StockService.movements.read(null, {
      document_uuid : selectedRow.document_uuid,
      is_exit : 1,
    })
      .then((transfers) => {
        Instance.close(transfers);
      })
      .catch(Notify.errorHandler);
  }

  // cancel
  function cancel() {
    Instance.close();
  }

  load();
}

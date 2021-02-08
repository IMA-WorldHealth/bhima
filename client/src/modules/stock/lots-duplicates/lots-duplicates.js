angular.module('bhima.controllers')
  .controller('DuplicateLotsController', DuplicateLotsController);

DuplicateLotsController.$inject = [
  'LotService', 'NotifyService', 'uiGridConstants', 'StockModalService',
  'SessionService', 'GridStateService', '$state', 'GridColumnService',
];

/**
 * Stock Inventory Controller
 * This module is a registry page for stock inventories
 */
function DuplicateLotsController(
  Lots, Notify, uiGridConstants, Modal,
  Session, GridState, $state, Columns,
) {
  const vm = this;
  const cacheKey = 'duplicate-lots-grid';
  vm.enterprise = Session.enterprise;

  // const duplicateLotsFilters = Stock.filter.inventory;

  const columns = [
    {
      field : 'label',
      displayName : 'TABLE.COLUMNS.LABEL',
      headerTooltip : 'TABLE.COLUMNS.LABEL',
      headerCellFilter : 'translate',

    }, {
      field : 'inventory_text',
      displayName : 'TABLE.COLUMNS.INVENTORY',
      headerTooltip : 'TABLE.COLUMNS.INVENTORY',
      headerCellFilter : 'translate',
      width : '20%',
    }, {
      field : 'quantity',
      displayName : 'TABLE.COLUMNS.QUANTITY',
      headerTooltip : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'initial_quantity',
      displayName : 'STOCK.INITIAL_QUANTITY',
      headerTooltip : 'STOCK.INITIAL_QUANTITY',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'unit_cost',
      displayName : 'TABLE.COLUMNS.UNIT_PRICE',
      headerTooltip : 'TABLE.COLUMNS.UNIT_PRICE',
      headerCellFilter : 'translate',
      cellFilter : `currency:${vm.enterprise.currency_id}`,
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'entry_date',
      displayName : 'STOCK.ENTRY_DATE',
      headerTooltip : 'STOCK.ENTRY_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
      cellClass : 'text-right',
    }, {
      field : 'expiration_date',
      displayName : 'STOCK.EXPIRATION_DATE',
      headerTooltip : 'STOCK.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date:"mediumDate"',
      cellClass : 'text-right',
    }, {
      field : 'num_duplicates',
      displayName : 'TABLE.COLUMNS.NUM_DUPLICATE_LOTS',
      headerTooltip : 'TABLE.COLUMNS.NUM_DUPLICATE_LOTS',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      type : 'number',
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/stock/lots-duplicates/templates/action.cell.html',
    },
  ];

  const footerTemplate = `
    <div class="ui-grid-cell-contents">
      <b>{{ grid.appScope.gridOptions.data.length }}</b>
      <span translate>FORM.INFO.FOUND</span>
    </div>
  `;

  vm.gridOptions = {
    appScopeProvider   : vm,
    enableColumnMenus  : false,
    columnDefs         : columns,
    showGridFooter     : true,
    gridFooterTemplate : footerTemplate,
    fastWatch          : true,
    flatEntityAccess   : true,
    onRegisterApi,
  };

  const gridColumns = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  vm.gridApi = {};
  vm.saveGridState = state.saveGridState;

  function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  // expose view logic
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.clearGridState = clearGridState;

  // This function opens a modal through column service to let the user toggle
  // the visibility of the inventories registry's columns.
  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    gridColumns.openConfigurationModal();
  }

  // load stock lots in the grid
  function load() {
    vm.hasError = false;
    vm.loading = true;

    Lots.dupes({ find_dupes : true })
      .then((rows) => {
        vm.gridOptions.data = rows;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // lot duplicates modal
  vm.openDuplicatesModal = (uuid, depotUuid) => {
    // NOTE: depotUuid is undefined (for now)
    Modal.openDuplicateLotsModal({ uuid, depotUuid })
      .then((res) => {
        if (res === 'success') {
          // Reload the duplicate lots since some lots were merged
          load();
        }
      });
  };

  function startup() {
    load();
  }

  startup();
}

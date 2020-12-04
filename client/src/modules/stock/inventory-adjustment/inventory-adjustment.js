angular.module('bhima.controllers')
  .controller('StockInventoryAdjustmentController', StockInventoryAdjustmentController);

// dependencies injections
StockInventoryAdjustmentController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'uiGridConstants',
];

/**
 * @class StockInventoryAdjustmentController
 *
 * @description
 * This module exists to make sure that existing stock can be adjusted entirely
 */
function StockInventoryAdjustmentController(
  Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, uiGridConstants,
) {
  const vm = this;

  const { INVENTORY_ADJUSTMENT } = bhConstants.flux;

  // global variables
  vm.Stock = new StockForm('StockInventoryAdjustment');
  vm.movement = {};

  vm.onDateChange = date => {
    vm.movement.date = date;
    loadInventories(vm.depot);
  };

  vm.onChangeDepot = depot => {
    vm.depot = depot;
    loadInventories(vm.depot);
  };

  // bind constants
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();

  // bind methods
  vm.submit = submit;

  const expirationDateCellTemplate = `
    <div class="ui-grid-cell-contents">
      <span am-time-ago="row.entity.expiration_date"></span>
    </div>
  `;

  // grid columns
  const columns = [
    {
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
      enableFiltering : false,
    }, {
      field : 'code',
      width : 120,
      displayName : 'TABLE.COLUMNS.CODE',
      headerCellFilter : 'translate',
    }, {
      field : 'text',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      enableSorting : true,
    }, {
      field : 'label',
      width : 150,
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      enableSorting : true,
    }, {
      field : 'old_quantity',
      width : 150,
      displayName : 'INVENTORY_ADJUSTMENT.OLD_QUANTITY',
      headerCellFilter : 'translate',
      enableFiltering : false,
    }, {
      field : 'quantity',
      width : 180,
      displayName : 'INVENTORY_ADJUSTMENT.NEW_QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/inventory-adjustment/templates/quantity.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      enableFiltering : false,
    }, {
      field : 'expiration_date',
      width : 150,
      displayName : 'TABLE.COLUMNS.EXPIRATION_DATE',
      headerCellFilter : 'translate',
      cellTemplate : expirationDateCellTemplate,
      enableFiltering : false,
    },
  ];

  // grid options
  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : true,
    enableColumnMenus : false,
    columnDefs : columns,
    data : vm.Stock.store.data,
    fastWatch : true,
    flatEntityAccess : true,
    rowTemplate : 'modules/templates/grid/error.row.html',
    onRegisterApi : onRegisterApiFn,
  };

  // register api
  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  // inline filter
  vm.toggleInlineFilter = () => {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  function setupStock() {
    vm.Stock.setup();
    vm.Stock.store.clear();
  }

  function startup() {
    vm.movement = {
      date : new Date(),
      entity : {},
    };
  }

  // ============================ Inventories ==========================
  vm.reloadInventories = () => {
    loadInventories(vm.depot);
  };

  function loadInventories(depot) {
    vm.loading = true;
    setupStock();

    Stock.lots.read(null, {
      depot_uuid : depot.uuid,
      includeEmptyLot : vm.includeEmptyLot || 0,
      dateTo : vm.movement.date,
    })
      .then(lots => {

        const n = lots.length;
        let i = 0;

        while (i < n) {
          const lot = lots[i];
          const row = vm.Stock.addItems(1);

          row.configure(lot);

          Object.assign(row, {
            old_quantity : row.quantity,

            // overwrite the default validation function as it doesn't make sense in
            // this case.
            validate() {
              return this.quantity >= 0;
            },
          });

          i++;
        }

        // run validation on all rows
        vm.Stock.validate();
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // ================================= Submit ================================
  function submit(form) {
    // check stock validity
    const isValid = vm.Stock.validate();

    if (!isValid || form.$invalid) { return 0; }

    const movement = {
      depot_uuid : vm.depot.uuid,
      date : vm.movement.date,
      description : vm.movement.description,
      is_exit : 0,
      flux_id : INVENTORY_ADJUSTMENT,
      user_id : Session.user.id,
    };

    const lots = vm.Stock.store.data.map((row) => {
      row.oldQuantity = row.old_quantity;
      return row;
    });

    movement.lots = lots.filter(lot => {
      return lot.quantity !== lot.oldQuantity;
    });

    if (!movement.lots.length) {
      Notify.warn('INVENTORY_ADJUSTMENT.NO_CHANGE');
      return 0;
    }

    return Stock.inventoryAdjustment.create(movement)
      .then(() => {
        // since we have effectively performed an inventory, instead of rendering a receipt,
        // we will render the "Articles in Stock" report for this depot.
        ReceiptModal.stockAdjustmentReport(movement.depot_uuid, movement.date, INVENTORY_ADJUSTMENT);

        startup();
        setupStock();
      })
      .catch(Notify.handleError);
  }

  startup();
}

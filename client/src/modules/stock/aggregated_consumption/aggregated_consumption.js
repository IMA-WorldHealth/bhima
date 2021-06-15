angular.module('bhima.controllers')
  .controller('StockAggregatedConsumptionController', StockAggregatedConsumptionController);

// dependencies injections
StockAggregatedConsumptionController.$inject = [
  'NotifyService', 'SessionService', 'util', '$translate',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'uiGridConstants', 'GridGroupingService', 'StockModalService',
];

/**
 * @class StockAggregatedConsumptionController
 *
 * @description
 * This module exists to Aggregated Consumption
 */
function StockAggregatedConsumptionController(
  Notify, Session, util, $translate, bhConstants, ReceiptModal, StockForm,
  Stock, uiGridConstants, Grouping, StockModal,
) {
  const vm = this;

  const { AGGREGATED_CONSUMPTION } = bhConstants.flux;

  // global variables
  vm.Stock = new StockForm('StockAggregatedConsumption');
  vm.movement = {};
  vm.stockOut = {};
  vm.setConsumptionByLots = setConsumptionByLots;
  vm.checkValidation = checkValidation;

  vm.currentInventories = [];
  vm.overconsumption = [];

  vm.onSelectFiscalYear = (fiscalYear) => {
    setupStock();
    vm.movement.fiscal_id = fiscalYear.id;
  };

  vm.onSelectPeriod = (period) => {
    vm.movement.hrLabel = period.hrLabel;
    vm.movement.date = period.end_date;
    vm.movement.start_date = period.start_date;
    vm.currentDate = new Date();

    if (vm.currentDate < vm.movement.date) {
      Notify.warn('FORM.WARNINGS.AGGREGATED_STOCK_MODULE');
      setupStock();
      return;
    }

    vm.movement.period_id = period.id;
    loadInventories(vm.depot);
    loadCurrentInventories(vm.depot);
  };

  vm.onChangeDepot = depot => {
    vm.depot = depot;
    loadInventories(vm.depot);
    loadCurrentInventories(vm.depot);
  };

  /**
   * @method setConsumptionByLots
   * @param {object} stockLine
   * @description [grid] pop up a modal for defining consumption lots for each row in the grid
   */
  function setConsumptionByLots(stockLine) {
    stockLine.start_date = vm.movement.start_date;
    stockLine.end_date = vm.movement.date;

    StockModal.openConsumptionByLots({
      stockLine,
    })
      .then((res) => {
        if (!res) { return; }
        stockLine.detailed = res.lots;
      })
      .catch(Notify.handleError);
  }

  // bind constants
  vm.maxLength = util.maxLength;
  vm.maxDate = new Date();

  // bind methods
  vm.submit = submit;

  // grid columns
  const columns = [
    {
      field : 'text',
      width : 350,
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      enableSorting : true,
    }, {
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/status.tmpl.html',
      enableFiltering : false,
    }, {
      field : 'code',
      displayName : 'TABLE.COLUMNS.CODE',
      headerCellFilter : 'translate',
    }, {
      field : 'label',
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      enableSorting : true,
    }, {
      field : 'quantity_opening',
      displayName : 'STOCK.AGGREGATED_STOCK_CONSUMPTION.STOCK_BEGINNING',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      cellClass : 'text-right',
      enableFiltering : false,
    }, {
      field : 'total_quantity_entry',
      displayName : 'STOCK.AGGREGATED_STOCK_CONSUMPTION.TOTAL_ENTRIES',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      cellClass : 'text-right',
      enableFiltering : false,
    }, {
      field : 'total_quantity_exit',
      displayName : 'STOCK.AGGREGATED_STOCK_CONSUMPTION.TOTAL_EXITS',
      headerCellFilter : 'translate',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      cellClass : 'text-right',
      enableFiltering : false,
    }, {
      field : 'quantity_consumed',
      width : '12%',
      displayName : 'STOCK.QUANTITY_CONSUMED',
      headerToolTip : 'STOCK.QUANTITY_CONSUMED',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/quantity_consumed.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      enableFiltering : false,
    }, {
      field : 'quantity_lost',
      width : '10%',
      displayName : 'STOCK.QUANTITY_LOST',
      headerToolTip : 'STOCK.QUANTITY_LOST',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/quantity_lost.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      enableFiltering : false,
    }, {
      field : 'days_stock_out',
      width : '12%',
      displayName : 'STOCK.DAYS_OF_STOCK_OUT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/days_stock_out.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      enableFiltering : false,
    }, {
      field : 'consumption',
      displayName : 'TABLE.COLUMNS.CONSUMPTION',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/lot_aggregate.tmpl.html',
    }, {
      field : 'old_quantity',
      displayName : 'STOCK.AGGREGATED_STOCK_CONSUMPTION.STOCK_END',
      aggregationType : uiGridConstants.aggregationTypes.sum,
      cellClass : 'text-right',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/aggregated_consumption/templates/quantity_remain.tmpl.html',
      enableFiltering : false,
    }];

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

  vm.grouping = new Grouping(vm.gridOptions, true, 'text', vm.grouped, true);

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
    vm.stockOut = {};
    vm.movement.description = '';
  }

  function startup() {
    setupStock();
  }

  // ============================ Inventories ==========================
  vm.reloadInventories = () => {
    loadInventories(vm.depot);
  };

  function loadInventories(depot) {
    if (!vm.movement.date) { return 0; }

    vm.loading = true;
    setupStock();

    return Stock.lotsDetailed.read(null, {
      depot_uuid : depot.uuid,
      includeEmptyLot : vm.includeEmptyLot || 0,
      startDate : vm.movement.start_date,
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
        vm.grouping.unfoldAllGroups();
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function loadCurrentInventories(depot, dateTo = new Date()) {
    vm.loading = true;
    Stock.lots.read(null, { depot_uuid : depot.uuid, dateTo })
      .then(lots => {
        vm.currentInventories = lots.filter(item => item.quantity > 0);
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function checkValidation(consumptionData) {
    let valid = true;

    consumptionData.forEach(item => {
      if (item.old_quantity < (item.quantity_consumed + item.quantity_lost)) {
        valid = false;
      }
    });

    return valid;
  }

  // ================================= Submit ================================
  function submit(form) {
    // check stock validity
    const i18nKeys = {
      depot : vm.depot.text,
      period : vm.movement.hrLabel,
      user : Session.user.display_name,
    };

    const checkOverconsumption = vm.Stock.store.data;

    checkOverconsumption.forEach(stock => {
      stock.quantityAvailable = 0;

      vm.currentInventories.forEach(lot => {
        if (lot.uuid === stock.uuid) {
          stock.quantityAvailable = lot.quantity;
        }
      });
    });

    vm.overconsumption = checkOverconsumption.filter(
      c => (c.quantity_consumed + c.quantity_lost) > c.quantityAvailable,
    );

    if (vm.overconsumption.length) {
      vm.overconsumption.forEach(item => {
        item.textI18n = {
          text : item.text,
          label : item.label,
          quantityAvailable : item.quantityAvailable,
          quantity : (item.quantity_consumed + item.quantity_lost),
        };
      });

      Notify.danger('ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_AGGREGATE_CONSUMPTION');
      vm.$loading = false;
      return 0;
    }

    const formatedDescription = $translate.instant('STOCK.EXIT_AGGREGATE_CONSUMPTION', i18nKeys);

    const isValid = vm.Stock.validate();
    const isValidConsumption = checkValidation(vm.Stock.store.data);

    if (!isValidConsumption) {
      Notify.danger('FORM.WARNINGS.INVALID_CONSUMPTION');
    }

    if (!isValid || form.$invalid || !isValidConsumption) { return 0; }

    const movement = {
      depot_uuid : vm.depot.uuid,
      date : vm.movement.date,
      description : vm.movement.description
        ? formatedDescription.concat(' : ', vm.movement.description) : formatedDescription,
      is_exit : 0,
      flux_id : AGGREGATED_CONSUMPTION,
      user_id : Session.user.id,
      stock_out : vm.stockOut,
      fiscal_id : vm.movement.fiscal_id,
      period_id : vm.movement.period_id,
    };

    const lots = vm.Stock.store.data.map((row) => {
      row.oldQuantity = row.old_quantity;
      return row;
    });

    // Here we filter the products that were either consumed or lost
    movement.lots = lots.filter(lot => {
      return ((lot.quantity_consumed > 0 || lot.quantity_lost > 0)
        && (lot.old_quantity >= (lot.quantity_consumed + lot.quantity_lost)));
    });

    return Stock.aggregatedConsumption.create(movement)
      .then(() => {
        // since we have effectively performed an inventory, instead of rendering a receipt,
        // we will render the "Articles in Stock" report for this depot.
        ReceiptModal.stockAdjustmentReport(movement.depot_uuid, movement.date, AGGREGATED_CONSUMPTION);

        startup();
        return loadInventories(vm.depot);
      })
      .catch(Notify.handleError);
  }

  startup();
}

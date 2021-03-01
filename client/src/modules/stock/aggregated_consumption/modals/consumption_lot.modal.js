angular.module('bhima.controllers')
  .controller('StockConsumptionLotsModalController', StockConsumptionLotsModalController);

StockConsumptionLotsModalController.$inject = [
  'appcache', '$uibModalInstance', 'uiGridConstants', 'data',
  'SessionService', 'bhConstants', 'AggregateConsumptionModalForm', 'focus',
];

function StockConsumptionLotsModalController(
  AppCache, Instance, uiGridConstants, Data, Session, bhConstants, AggregateForm, Focus,
) {
  const vm = this;

  const cache = new AppCache('StockEntryModal');

  // initialize the form instance
  vm.form = new AggregateForm({
    max_quantity_consumed : Data.stockLine.quantity_consumed,
    max_quantity_lost : Data.stockLine.quantity_lost,
    unit_cost : Data.stockLine.unit_cost,
    lot : Data.stockLine.label,
    end_date : Data.stockLine.end_date,
    start_date : Data.stockLine.start_date,
    rows : Data.stockLine.detailed,
  });

  vm.hasMissingLotIdentifier = false;
  vm.hasInvalidLotExpiration = false;
  vm.hasInvalidLotQuantity = false;

  vm.enterprise = Session.enterprise;
  vm.stockLine = angular.copy(Data.stockLine);

  vm.entryType = Data.entry_type;
  vm.isTransfer = (vm.entryType === 'transfer_reception');

  // exposing method to the view
  vm.submit = submit;
  vm.cancel = cancel;

  vm.onLotBlur = onLotBlur;
  vm.onChanges = onChanges;
  vm.onChangeQuantity = onChangeQuantity;
  vm.onChangeUnitCost = onChangeUnitCost;
  vm.onDateChange = onDateChange;

  vm.isCostEditable = (vm.entryType !== 'transfer_reception');

  const cols = [{
    field : 'status',
    width : 25,
    displayName : '',
    cellTemplate : 'modules/stock/entry/modals/templates/lot.status.tmpl.html',
  }, {
    field : 'movement_date',
    type : 'date',
    cellFilter : `date:"${bhConstants.dates.format}"`,
    width : 200,
    displayName : 'STOCK.AGGREGATED_STOCK_CONSUMPTION.CONSUMPTION_TO_DATE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/stock/aggregated_consumption/templates/lot_movement_date.tmpl.html',
  }, {
    field : 'quantity_consumed',
    type : 'number',
    width : 150,
    displayName : 'STOCK.QUANTITY_CONSUMED',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellClass : 'text-right',
    cellTemplate : 'modules/stock/aggregated_consumption/templates/consumed.tmpl.html',
  }, {
    field : 'quantity_lost',
    type : 'number',
    width : 150,
    displayName : 'STOCK.QUANTITY_LOST',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellClass : 'text-right',
    cellTemplate : 'modules/stock/aggregated_consumption/templates/lost.tmpl.html',
  }, {
    field : 'actions',
    cellTemplate : 'modules/stock/entry/modals/templates/lot.actions.tmpl.html',
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    data : vm.form.rows,
    columnDefs : cols,
    onRegisterApi,
  };

  function init() {
    if (cache.enableFastInsert) {
      vm.enableFastInsert = cache.enableFastInsert;
    }

    if (vm.form.rows.length) { return; }

    vm.form.addItem();
  }

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  /**
   * @method onLotBlur
   *
   * @description
   * if the fast insert option is enable do this :
   * - add new row automatically on blur
   * - set the focus in the new row
   * @param {string} rowLot the row.entity.lot string
   */
  function onLotBlur(rowLot) {
    if (vm.enableFastInsert && rowLot) {

      const emptyLotRow = getFirstEmptyLot();

      if (emptyLotRow) {
        // don't add new row but focus on the empty lot row
        Focus(emptyLotRow.identifier);
      } else {
        // add a new row
        const newLotRow = vm.form.addItem();
        // set the focus on the new row
        Focus(newLotRow.identifier);
      }
    }
  }

  function getFirstEmptyLot() {
    let line;
    for (let i = 0; i < vm.form.rows.length; i++) {
      const row = vm.form.rows[i];
      if (!row.lot || row.lot.length === 0) {
        line = row;
        break;
      }
    }
    return line;
  }

  function onChanges() {
    vm.errors = vm.form.validate();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  }

  // validate only if there are rows
  function onChangeQuantity() {
    vm.form.setMaxQuantityConsumed(vm.stockLine.quantity_consumed);
    vm.form.setMaxQuantityLost(vm.stockLine.quantity_lost);
    if (!vm.form.rows.length) { return; }
    onChanges();
  }

  function onChangeUnitCost() {
    vm.form.setUnitCost(vm.stockLine.unit_cost);
    onChanges();
  }

  function onDateChange(date, row) {
    if (date) {
      row.end_date = date;
      onChanges();
    }
  }

  function cancel() {
    saveSetting();
    Instance.close();
  }

  function submit(form) {
    vm.errors = vm.form.validate();
    // unfortunately, a negative number will not trigger the onChange() function
    // on the quantity, since the "min" property is set on the input.  So, we
    // need to through a generic error here.
    if (form.$invalid) {
      return;
    }

    if (vm.errors.length === 0) {
      saveSetting();

      Instance.close({
        lots : vm.form.rows,
        unit_cost : vm.stockLine.unit_cost,
      });
    }
  }

  function saveSetting() {
    // save the cache setting
    cache.enableFastInsert = vm.enableFastInsert;
  }

  init();
}

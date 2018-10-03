angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  'appcache', '$uibModalInstance', 'uiGridConstants', 'data',
  'SessionService', 'bhConstants', 'StockEntryModalForm', 'focus',
];

function StockDefineLotsModalController(
  AppCache, Instance, uiGridConstants, Data, Session, bhConstants, EntryForm, Focus
) {
  const vm = this;

  const cache = new AppCache('StockEntryModal');

  // initialize the form instance
  vm.form = new EntryForm({
    max_quantity : Data.stockLine.quantity,
    expires : Data.stockLine.expires,
    rows : Data.stockLine.lots,
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
  vm.onDateChange = onDateChange;

  vm.isCostEditable = (vm.entryType !== 'transfer_reception');

  const cols = [{
    field : 'status',
    width : 25,
    displayName : '',
    cellTemplate : 'modules/stock/entry/modals/templates/lot.status.tmpl.html',
  }, {
    field : 'lot',
    displayName : 'TABLE.COLUMNS.LOT',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.count,
    aggregationHideLabel : true,
    cellTemplate : 'modules/stock/entry/modals/templates/lot.input.tmpl.html',
  }, {
    field : 'quantity',
    type : 'number',
    width : 150,
    displayName : 'TABLE.COLUMNS.QUANTITY',
    headerCellFilter : 'translate',
    aggregationType : uiGridConstants.aggregationTypes.sum,
    aggregationHideLabel : true,
    footerCellClass : 'text-right',
    cellTemplate : 'modules/stock/entry/modals/templates/lot.quantity.tmpl.html',
  }, {
    field : 'expiration_date',
    type : 'date',
    cellFilter : `date:"${bhConstants.dates.format}"`,
    width : 150,
    visible : (vm.stockLine.expires !== 0),
    displayName : 'TABLE.COLUMNS.EXPIRATION_DATE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/stock/entry/modals/templates/lot.expiration.tmpl.html',
  }, {
    field : 'actions',
    width : 25,
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
    vm.form.setMaxQuantity(vm.stockLine.quantity);
    vm.errors = vm.form.validate();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  }

  // validate only if there are lots rows
  function onChangeQuantity() {
    if (!vm.form.rows.length) { return; }
    onChanges();
  }

  function onDateChange(date, row) {
    if (date) {
      row.expiration_date = date;
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
        quantity : vm.form.total(),
      });
    }
  }

  function saveSetting() {
    // save the cache setting
    cache.enableFastInsert = vm.enableFastInsert;
  }

  init();
}

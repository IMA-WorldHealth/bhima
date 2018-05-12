angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'uiGridConstants', 'data',
  'SessionService', 'bhConstants', 'StockEntryModalForm',
];

function StockDefineLotsModalController(Instance, Notify, uiGridConstants, Data, Session, bhConstants, EntryForm) {
  const vm = this;

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

  vm.onChanges = onChanges;
  vm.onDateChange = onDateChange;

  vm.isCostEditable = (vm.entryType !== 'purchase' && vm.entryType !== 'transfer_reception');

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
    if (vm.form.rows.length) { return; }
    vm.form.addItem();
  }

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  function onChanges() {
    vm.form.setMaxQuantity(vm.stockLine.quantity);
    vm.errors = vm.form.validate();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  }

  function onDateChange(date, row) {
    if (date) {
      row.expiration_date = date;
      onChanges();
    }
  }

  function cancel() {
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
      Instance.close({
        lots : vm.form.rows,
        unit_cost : vm.stockLine.unit_cost,
        quantity : vm.form.total(),
      });
    }
  }

  init();
}

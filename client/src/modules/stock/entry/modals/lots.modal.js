angular.module('bhima.controllers')
  .controller('StockDefineLotsModalController', StockDefineLotsModalController);

StockDefineLotsModalController.$inject = [
  'appcache', '$uibModalInstance', 'uiGridConstants', 'data', 'SessionService',
  'CurrencyService', 'NotifyService', 'bhConstants', 'StockEntryModalForm',
  '$translate', 'focus',
];

function StockDefineLotsModalController(
  AppCache, Instance, uiGridConstants, Data, Session,
  Currencies, Notify, bhConstants, EntryForm,
  $translate, Focus,
) {
  const vm = this;

  const cache = new AppCache('StockEntryModal');

  // initialize the form instance
  const tracking = Data.stockLine.tracking_expiration;
  vm.form = new EntryForm({
    max_quantity : Data.stockLine.quantity,
    unit_cost : Data.stockLine.unit_cost,
    tracking_expiration : tracking,
    entry_date : Data.entry_date,
    rows : Data.stockLine.lots,
  });

  vm.Constants = bhConstants;
  vm.hasMissingLotIdentifier = false;
  vm.hasInvalidLotExpiration = false;
  vm.hasInvalidLotQuantity = false;

  vm.enterprise = Session.enterprise;
  vm.stockLine = angular.copy(Data.stockLine);
  vm.entryType = Data.entry_type;
  vm.entryDate = Data.entry_date;
  vm.currencyId = Data.currency_id !== undefined
    ? Data.currency_id : vm.enterprise.currency_id;
  vm.currency = null;
  vm.isTransfer = (vm.entryType === 'transfer_reception');

  // exposing method to the view
  vm.submit = submit;
  vm.cancel = cancel;

  vm.onLotBlur = onLotBlur;
  vm.onChanges = onChanges;
  vm.onChangeQuantity = onChangeQuantity;
  vm.onChangeUnitCost = onChangeUnitCost;
  vm.onDateChange = onDateChange;

  vm.onSelectLot = onSelectLot;

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
    visible : tracking,
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
    enableColumnResize : true,
    enableColumnMenus : false,
    showColumnFooter : true,
    fastWatch : true,
    flatEntityAccess : true,
    data : vm.form.rows,
    minRowsToShow : 4,
    columnDefs : cols,
    onRegisterApi,
  };

  function init() {
    if (cache.enableFastInsert) {
      vm.enableFastInsert = cache.enableFastInsert;
    }

    // Load the currency info
    Currencies.read()
      .then((currencies) => {
        vm.currency = currencies.find(curr => curr.id === vm.currencyId);
        vm.currency.label = Currencies.format(vm.currencyId);
      })
      .catch(Notify.handleError);

    if (vm.form.rows.length) {
      // If we are visiting the form again, re-validate it
      validateForm();
      return;
    }

    vm.form.addItem();
  }

  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // Handle the extra validation for expired lot labels
  function validateForm() {
    vm.errors = vm.form.validate(vm.entryDate);
    vm.form.rows.forEach((row) => {
      if (!row.lot) {
        // Ignore corner case where the user clicks elsewhere
        // BEFORE typing in a lot name
        return;
      }

      // Note that the type of row.lot will differ depending on whether
      // we are selecting an existing lot or creating a new one.
      const lotLabel = typeof row.lot === 'string' ? row.lot : row.lot.label;
      const existingLot = vm.stockLine.availableLots
        .find(l => l.label.toUpperCase() === lotLabel.toUpperCase());
      if (existingLot) {
        // Disable changing the date for rows with lots already defined.
        // (This does not prevent changing the quantity.)
        row.disabled = true;
      }

      // Check to make sure the lot has not expired
      if (existingLot && existingLot.expired) {

        vm.errors.push($translate.instant('ERRORS.ER_STOCK_LOT_IS_EXPIRED',
          { label : existingLot.label }));
        vm.form.$invalid = true;
      }

    });
  }

  /**
   * @method onLotBlur
   *
   * @description
   * if the fast insert option is enable do this :
   * - add new row automatically on blur
   * - set the focus in the new row
   * @param {string} rowLot the row.entity.lot string/object
   */
  function onLotBlur(rowLot) {
    // NOTE: rowLot will be an object if an existed lot was
    //       selected from the typeahead. Otherwise
    //       it will be the lot name string that was typed in.
    //       Complain if the lot exists and is expired.

    if (!rowLot) {
      // Handle corner case
      return;
    }

    // First make sure that if the entered lot label exists
    // that it is not expired

    const rowLotLabel = typeof rowLot === 'string' ? rowLot : rowLot.label;
    const existingLot = vm.stockLine.availableLots
      .find(l => l.label.toUpperCase() === rowLotLabel.toUpperCase());
    if (rowLot && existingLot && existingLot.expired) {
      vm.errors = vm.form.validate(vm.entryDate);
      vm.errors.push($translate.instant('ERRORS.ER_STOCK_LOT_IS_EXPIRED',
        { label : existingLot.label }));
      vm.form.$invalid = true;
      return;
    }

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
    validateForm();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  }

  // validate only if there are lots rows
  function onChangeQuantity() {
    vm.form.setMaxQuantity(vm.stockLine.quantity);
    if (!vm.form.rows.length) { return; }
    onChanges();
  }

  function onChangeUnitCost() {
    vm.form.setUnitCost(vm.stockLine.unit_cost);
    onChanges();
  }

  function onDateChange(date, row) {
    if (date) {
      row.expiration_date = date;
      onChanges();
    }
  }

  /**
   * @method onSelectLot
   *
   * @description
   * Updates the expiration field based on the date in
   * the corresponding candidate lot.
   *
   * NOTE: This function is only called when a lot is selected
   *       from the typeahead (which is created from the list
   *       valid candidate lots for this inventory item).  So
   *       the 'find()' below should always work.
   *
   * @param {object} entity the row.entity.lot object (being displayed)
   * @param {object} item the active typeahead model object
   */
  function onSelectLot(entity, item) {
    const lot = vm.stockLine.candidateLots.find(l => l.uuid === item.uuid);
    entity.expiration_date = new Date(lot.expiration_date);
    entity.disabled = true;
    onChanges();
  }

  function cancel() {
    saveSetting();
    Instance.close();
  }

  function submit(form) {
    validateForm();

    // unfortunately, a negative number will not trigger the onChange() function
    // on the quantity, since the "min" property is set on the input.  So, we
    // need to through a generic error here.
    if (form.$invalid) {
      return;
    }

    // Handle differences in selecting vs creating lots
    vm.form.rows.forEach((row) => {
      if (typeof row.lot !== 'string') {
        const { label, uuid } = row.lot;
        row.lot = label;
        row.uuid = uuid;
      }
    });

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

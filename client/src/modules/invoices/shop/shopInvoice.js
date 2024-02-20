angular.module('bhima.controllers')
  .controller('ShopInvoiceController', ShopInvoiceController);

// dependencies injections
ShopInvoiceController.$inject = [
  '$state', '$transition$', 'NotifyService', 'SessionService', 'util', 'bhConstants', 'ReceiptModal',
  'StockExitFormService', 'StockEntryExitTypeService', 'uiGridConstants', 'GridExportService',
  'DepotService', '$timeout', 'BarcodeService', 'StockModalService', 'StockEntryExitTypeService',
  'PatientInvoiceForm', 'PatientInvoiceService', 'ExchangeRateService',
];
/** @class ShopInvoiceController
 *
 * @description
 * This controller is responsible to handle stock exit module.
 */
function ShopInvoiceController(
  $state, $transition$, Notify, Session, util, bhConstants, ReceiptModal,
  StockForm, ExitTypes, uiGridConstants, GridExportService,
  Depot, $timeout, Barcode, StockModal, TypeService, PatientInvoiceForm, InvoiceService,
  Exchange,
) {
  const vm = this;

  const { params } = $state;

  vm.stockForm = new StockForm('StockShopExit');
  vm.Invoice = new PatientInvoiceForm('PatientInvoiceForm');

  // set allowExpired to be false
  vm.stockForm.setAllowExpired(false);

  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;
  vm.DATE_FMT = bhConstants.dates.format;

  vm.enablePackaging = false;
  vm.stockSettings = Session.stock_settings;
  vm.setPackaging = setPackaging;

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;

  vm.selectedExitType = {};
  vm.onSelectExitType = onSelectExitType;
  vm.destLabel = '';
  vm.FORBID_PRICE_CHANGES = (Session.enterprise.settings.enable_price_lock);
  vm.handleChange = handleUIGridChange;

  vm.submit = submit;

  const gridFooterTemplate = `
    <div style="margin-left: 10px;">
      {{ grid.appScope.gridApi.core.getVisibleRows().length }}
      <span translate>TABLE.AGGREGATES.ROWS</span>
    </div>
  `;

  const gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    rowTemplate : 'modules/templates/grid/error.row.html',
    columnDefs : [{
      field : 'status',
      width : 25,
      displayName : '',
      cellTemplate : 'modules/stock/exit/templates/status.tmpl.html',
    }, {
      field : 'code',
      width : 120,
      displayName : 'INVENTORY.CODE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/code.tmpl.html',
    }, {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/description.tmpl.html',
    }, {
      field : 'lot',
      width : 250,
      displayName : 'TABLE.COLUMNS.LOT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/lot.tmpl.html',
    }, {
      field : 'packaging',
      displayName : '',
      width : 40,
      headerCellFilter : 'translate',
      cellFilter : 'translate',
      visible      : false,
      cellTemplate : 'modules/stock/exit/templates/packaging.cell.tmpl.html',
    }, {
      field : 'quantity',
      width : 150,
      displayName : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/invoices/templates/grid/quantity.invoice.exit.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
    }, {
      field : 'transaction_price',
      displayName : 'FORM.LABELS.UNIT_PRICE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/invoices/templates/grid/unit_price.tmpl.html',
      type : 'number',
    }, {
      field : 'amount',
      displayName : 'TABLE.COLUMNS.AMOUNT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/invoices/templates/grid/amount.tmpl.html',
      type : 'number',
    }, {
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellFilter : 'translate',
    }, {
      field : 'available_lot',
      width : 150,
      displayName : 'TABLE.COLUMNS.AVAILABLE',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/available.tmpl.html',
    }, {
      field : 'expiration_date',
      width : 150,
      displayName : 'TABLE.COLUMNS.EXPIRE_IN',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/expiration.tmpl.html',
    }, {
      displayName : '',
      field : 'actions',
      width : 25,
      cellTemplate : 'modules/stock/exit/templates/actions.tmpl.html',
    }],
    data : vm.stockForm.store.data,

    // fastWatch to false is required for updating the grid correctly for
    // inventories loaded from an invoice for patient exit
    fastWatch : false,
    flatEntityAccess : true,
    showGridFooter : true,
    gridFooterTemplate,
    onRegisterApi,
  };

  // exposing the grid options to the view
  vm.gridOptions = gridOptions;

  const exportation = new GridExportService(vm.gridOptions);

  // runs validation and updates the messages for the user
  vm.validate = () => {
    vm.stockForm.validate();
    vm.totals = InvoiceService.getTotal(vm.stockForm.store.data);
    vm.totalsCurrentExchangeRate = vm.isEnterpriseCurrency ? vm.totals : vm.totals * vm.currentExchangeRate;

    if (!vm.isEnterpriseCurrency) {
      vm.totalsCurrentExchangeRate = Exchange.roundConvertionExchangeRates(
        vm.totalsCurrentExchangeRate,
        vm.stockForm.details.min_monentary_unit,
      );
    }

    vm.messages = vm.stockForm.messages();
  };

  vm.setDepot = function setDepot(depot) {
    vm.enablePackaging = false;
    const column = vm.gridOptions.columnDefs.find(col => col.field === 'packaging');

    if (depot.is_count_per_container && vm.stockSettings.enable_packaging_pharmaceutical_products) {
      vm.enablePackaging = true;
    }

    column.visible = vm.enablePackaging;
    vm.gridApi.grid.refresh();
    vm.stockForm.setDepot(depot);
    vm.validate();
    vm.onSelectExitType();
  };

  vm.configureItem = function configureItem(row, lot) {
    vm.stockForm.configureItem(row, lot);
    vm.validate();
  };

  //
  vm.setLotFromDropdown = function setLotFromDropdown(row, lot) {
    vm.stockForm._pool.use(lot.lot_uuid);
    row.configure(lot);
    vm.stockForm.updateLotListings(row.inventory_uuid);
    vm.validate();
  };

  vm.removeItem = function removeItem(uuid) {
    vm.stockForm.removeItem(uuid);
    vm.validate();
  };

  /**
   * @method setPackaging
   * @param {object} item
   * @description [grid] pop up a modal for defining packaging
   */
  function setPackaging(item) {
    if (!item.inventory_uuid) {
      // Prevent the packaging modal pop-up if new inventory code has been selected
      return;
    }

    StockModal.openSetPackaging({
      item,
      currency_id : vm.currencyId,
      basic : true,
    })
      .then((res) => {
        if (!res) { return; }
        item.lots = res.lots;
        item.quantity = res.quantity;

        vm.validate();
      })
      .catch(Notify.handleError);
  }

  /**
   * @method exportGrid
   * @description export the content of the grid to csv.
   */
  vm.exportGrid = () => {
    exportation.exportToCsv('Stock_Exit_', exportation.defaultColumnFormatter, vm.stockForm.formatRowsForExport);
  };

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  //
  function onSelectExitType() {
    vm.stockForm.details.description = null;
    vm.selectedExitType = TypeService.exitTypes.filter(item => item.label === 'sale');

    vm.stockForm.setExitType(vm.selectedExitType[0].label);
    vm.stockForm.details.description = null;

    vm.stockForm.setSaleDistribution();
    // only allow expired stock if we are exiting to stock loss
    vm.stockForm.setAllowExpired(false);

    vm.validate();
  }

  // custom filter cashbox_id - assign the value to the searchQueries object
  vm.onSelectCashbox = function onSelectCashbox(cashbox) {
    console.log('NEW FORMmmmmmmmmm');
    console.log(cashbox); // cashBoxCurrencies

    vm.stockForm.details.cashbox_id = cashbox.id;
    vm.stockForm.details.account_id = cashbox.account_id;
    vm.stockForm.details.cash_box_id = cashbox.cash_box_id;
    vm.stockForm.details.currency_id = cashbox.currency_id;
    vm.stockForm.details.min_monentary_unit = cashbox.min_monentary_unit;
    vm.stockForm.details.cashBoxCurrencies = cashbox.cashBoxCurrencies;

    vm.isEnterpriseCurrency = vm.enterprise.currency_id === cashbox.currency_id;

    // make sure we have exchange rates available
    Exchange.read({ limit : 5 })
      .then(() => {
        vm.currentExchangeRate = Exchange.getExchangeRate(cashbox.currency_id, vm.stockForm.details.date);
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  };

  vm.setDate = function setDate(date) {
    vm.stockForm.setDate(date);
    vm.validate();
  };

  vm.clear = function clear() {
    vm.stockForm.clear();
    vm.validate();
  };

  function startup() {
    // setting params for grid loading state
    vm.hasError = false;

    vm.stockForm.setup();

    vm.validate();
  }

  vm.addItems = function addItems(numItems) {
    vm.stockForm.addItems(numItems);
    vm.validate();
  };

  // this function will be called whenever items change in the grid.
  function handleUIGridChange() {
    vm.totals = InvoiceService.getTotal(vm.stockForm.store.data);
    vm.validate();
  }

  vm.getLotByBarcode = function getLotByBarcode() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        if (record.uuid) {
          vm.stockForm.addLotByBarcode(record.uuid);
          vm.messages = vm.stockForm.messages();
        }
      });
  };

  /**
   * @function errorLineHighlight
   *
   * @description
   * Sets the grid's error flag on the row to render a red highlight
   * on the row.
   *
   */
  function errorLineHighlight(row) {
    const { ROW_ERROR_FLAG } = bhConstants.grid;
    // set and unset error flag for allowing to highlight again the row
    // when the user click again on the submit button
    row[ROW_ERROR_FLAG] = true;
    $timeout(() => { row[ROW_ERROR_FLAG] = false; }, 3000);
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    // run validation
    vm.validate();

    const isValidForSubmission = vm.stockForm.validate();

    // check if the form is valid
    if (isValidForSubmission === false) {

      let firstElement = true;

      vm.stockForm.store.data.forEach(row => {
        const hasErrors = row.errors().length > 0;
        if (hasErrors) {
          // flash the error highlight
          errorLineHighlight(row);

          // scroll to the first invalid item
          if (firstElement) {
            vm.gridApi.core.scrollTo(row);
            firstElement = false;
          }
        }
      });

      // flash the first error message to the user
      const [msg] = vm.stockForm.messages();
      Notify.danger(msg.text, 5000);

      return null;
    }

    const renderReceipt = ReceiptModal.getReceiptFnByFluxId(vm.stockForm.details.flux_id);

    const shipmentReady = vm.stockForm.details.isExit === true
      && vm.stockForm.details.from_depot
      && vm.stockForm.details.to_depot;

    if (vm.stockForm.details.shipment_uuid && !shipmentReady) {
      Notify.warn('Shipment Incorrect Data');
      return null;
    }

    return vm.stockForm.submit()
      .then(result => renderReceipt(result.uuid, true))
      .then(() => {
        if (($transition$.from().name === 'shipments') && !!params.shipment) {
          $state.go('shipments');
        }
        vm.stockForm.clear();
        vm.validate();
      })
      .catch(Notify.handleError);
  }

  startup();
}

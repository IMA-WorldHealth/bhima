angular.module('bhima.controllers')
  .controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockExitFormService',
  'StockModalService', 'uiGridConstants', '$translate',
  'GridExportService', 'Store', 'BarcodeService', '$timeout',
];

/**
 * @class StockExitController
 *
 * @description
 * This controller is responsible to handle stock exit module.
 */
function StockExitController(
  Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  StockModal, uiGridConstants, $translate, GridExportService, $timeout,
) {
  const vm = this;

  vm.stockForm = new StockForm('StockExit');

  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;
  vm.DATE_FMT = bhConstants.dates.format;

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;

  vm.onSelectExitType = onSelectExitType;
  vm.submit = submit;
  // vm.getLotByBarcode = getLotByBarcode;

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
      field : 'quantity',
      width : 150,
      displayName : 'TABLE.COLUMNS.QUANTITY',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/quantity.tmpl.html',
      aggregationType : uiGridConstants.aggregationTypes.sum,
    }, {
      field : 'unit',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
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

  // runs validation and updates the messages
  vm.validate = () => {
    vm.stockForm.validate();
    vm.messages = vm.stockForm.messages();
  };

  vm.configureItem = function configureItem(row, lot) {
    vm.stockForm.configureItem(row, lot);
    vm.validate();
  };

  vm.onRemoveItem = function onRemoveItem(uuid) {
    vm.stockForm.removeItem(uuid);
    vm.validate();
  };

  /**
   * @method exportGrid
   * @description export the content of the grid to csv.
   */
  vm.exportGrid = () => {
    exportation.exportToCsv('Stock_Exit_', exportation.defaultColumnFormatter, StockForm.formatRowsForExport);
  };

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  //
  function onSelectExitType(exitType, entity) {
    vm.stockForm.setExitType(exitType.label);

    switch (exitType.label) {
    case 'patient':
      vm.stockForm.setPatientDistribution(entity);
      break;
    case 'service':
      vm.stockForm.setServiceDistribution(entity);
      break;
    case 'depot':
      vm.stockForm.setDepotDistribution(entity);
      break;
    case 'loss':
      vm.stockForm.setLossDistribution(entity);
      break;
    default:
      break;
    }

    vm.validate();
  }

  function startup() {
    // setting params for grid loading state
    vm.loading = true;
    vm.hasError = false;

    vm.stockForm.setup();
    vm.validate();
  }

  vm.addItems = function addItems(numItems) {
    vm.stockForm.addItems(numItems);
    vm.validate();
  };

  /*
  function getLotByBarcode() {
    Barcode.modal({ shouldSearch : false })
      .then(record => {
        if (record.uuid) {
          Stock.lots.read(null, {
            depot_uuid : vm.stockForm.depot.uuid,
            label : record.uuid.toUpperCase(),
            dateTo : vm.movement.date,
            includeEmptyLot : 0,
          })
            .then(lots => {
              if (lots.length <= 0) {
                Notify.danger('STOCK.LOT_NOT_FOUND', 20000);
                return;
              }
              if (lots.length > 1) {
                Notify.danger('STOCK.DUPLICATE_LOTS', 20000);
                return;
              }

              // The lot is unique, construct a new row for it
              const lot = lots[0];
              const inventory = vm.mapSelectableInventories.get(lot.inventory_uuid);
              if (inventory) {
                const row = vm.stockForm.addItems(1);
                row.inventory = inventory;
                row.inventory_uuid = lot.inventory_uuid;
                row.quantity = 1;
                row.lot = lot;
                configureItem(row);
                vm.stockForm.validate();
                refreshSelectedLotsList(row);
              }
            });
        }
      });
  }
  */

  /**
   * @function errorLineHighlight
   *
   * @description
   * Sets the grid's error flag on the row to render a red highlight
   * on the row.
   *
   */
  function errorLineHighlight(rowIdx, store) {
    const { ROW_ERROR_FLAG } = bhConstants.grid;
    // set and unset error flag for allowing to highlight again the row
    // when the user click again on the submit button
    const row = store.data[rowIdx];
    row[ROW_ERROR_FLAG] = true;
    $timeout(() => {
      row[ROW_ERROR_FLAG] = false;
    }, 3000);
  }

  function submit(form) {
    if (form.$invalid) { return null; }

    // run validation
    vm.validate();

    // check if the form is valid
    if (vm.stockForm.validate() === false) {

      let firstElement = true;

      vm.stockForm.store.data.forEach((row, idx) => {
        const hasErrors = row.errors().length > 0;
        if (hasErrors) {
          // flash the error highlight
          errorLineHighlight(idx, this.store);

          // scroll to the first invalid item
          if (firstElement) {
            vm.gridApi.core.scrollTo(row);
            firstElement = false;
          }
        }
      });

      return null;
    }

    return vm.stockForm.submit()
      .then(() => vm.stockForm.clear());
  }

  // // submit patient
  // function submitPatient(form) {
  //   const invoiceUuid = vm.movement.entity.instance.invoice && vm.movement.entity.instance.invoice
  //     ? vm.movement.entity.instance.invoice.details.uuid : null;

  //   const movement = {
  //     depot_uuid : vm.stockForm.depot.uuid,
  //     entity_uuid : vm.movement.entity.uuid,
  //     invoice_uuid : invoiceUuid,
  //     date : vm.movement.date,
  //     description : vm.movement.description,
  //     is_exit : 1,
  //     flux_id : bhConstants.flux.TO_PATIENT,
  //     user_id : vm.stockForm.details.user_id,
  //   };

  //   const lots = vm.stockForm.store.data.map(formatLot);

  //   movement.lots = lots;

  //   return buildDescription(movement.entity_uuid, movement.invoice_uuid)
  //     .then(description => {
  //       movement.description = String(description).concat(vm.movement.description);
  //       return Stock.movements.create(movement);
  //     })
  //     .then(document => {
  //       ReceiptModal.stockExitPatientReceipt(document.uuid, bhConstants.flux.TO_PATIENT);
  //       reinit(form);
  //     })
  //     .catch(Notify.handleError);
  // }

  // // submit depot
  // function submitDepot(form) {
  //   let documentUuid;

  //   const movement = {
  //     from_depot : vm.stockForm.depot.uuid,
  //     from_depot_is_warehouse : vm.stockForm.depot.is_warehouse,
  //     to_depot : vm.movement.entity.uuid,
  //     date : vm.movement.date,
  //     description : vm.movement.description,
  //     isExit : true,
  //     user_id : vm.stockForm.details.user_id,
  //     stock_requisition_uuid : vm.requisition.uuid,
  //   };

  //   const lots = vm.stockForm.store.data.map(formatLot);

  //   movement.lots = lots;

  //   return Stock.movements.create(movement)
  //     .then(document => {
  //       documentUuid = document.uuid;
  //       // update requisition status if needed
  //       if (!vm.requisition.uuid) { return null; }

  //       const movementRequisition = {
  //         stock_requisition_uuid : vm.requisition.uuid,
  //       };

  //       const COMPLETED_STATUS = bhConstants.stockRequisition.completed_status;
  //       return Stock.stockRequisition.update(vm.requisition.uuid, {
  //         status_id : COMPLETED_STATUS,
  //         movementRequisition,
  //       });
  //     })
  //     .then(() => {
  //       ReceiptModal.stockExitDepotReceipt(documentUuid, bhConstants.flux.TO_OTHER_DEPOT);
  //       reinit(form);
  //     })
  //     .catch(Notify.handleError);
  // }

  startup();
}

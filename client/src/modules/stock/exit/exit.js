angular.module('bhima.controllers')
  .controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockExitFormService', 'StockService',
  'StockModalService', 'uiGridConstants', '$translate',
  'GridExportService', 'Store', 'BarcodeService',
];

/**
 * @class StockExitController
 *
 * @description
 * This controller is responsible to handle stock exit module.
 */
function StockExitController(
  Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, StockModal, uiGridConstants, $translate, GridExportService,
) {
  const vm = this;

  vm.today = new Date();
  vm.stockForm = new StockForm('StockExit');

  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;
  vm.DATE_FMT = bhConstants.dates.format;

  vm.message = { type : 'info', text : 'FORM.INFO.NO_DESTINATION' };

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
      field : 'unit_type',
      width : 75,
      displayName : 'TABLE.COLUMNS.UNIT',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/stock/exit/templates/unit.tmpl.html',
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

  vm.validate = () => vm.stockForm.validate();

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
      console.error('Cannot find exitType:', exitType);
      break;
    }

    vm.stockForm.setExitType(exitType.label);
  }

  function startup() {
    // setting params for grid loading state
    vm.loading = true;
    vm.hasError = false;

    vm.stockForm.setup();
  }

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

  function submit(form) {
    console.log('clicked submit() with invalid state:', form.$invalid);
    if (form.$invalid) { return null; }

    if (vm.stockForm.validate() === false) {
      console.log('vm.stockForm.validate()', vm.stockForm.validate());
      vm.errors = vm.stockForm.errors();
      return;
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

  // // submit service
  // function submitService(form) {
  //   let documentUuid;

  //   const movement = {
  //     depot_uuid : vm.stockForm.depot.uuid,
  //     entity_uuid : vm.movement.entity.uuid,
  //     date : vm.movement.date,
  //     description : vm.movement.description,
  //     is_exit : 1,
  //     flux_id : bhConstants.flux.TO_SERVICE,
  //     user_id : vm.stockForm.details.user_id,
  //     stock_requisition_uuid : vm.requisition.uuid,
  //   };

  //   const lots = vm.stockForm.store.data.map(formatLot);

  //   movement.lots = lots;

  //   return buildDescription(movement.entity_uuid)
  //     .then(description => {
  //       movement.description = String(description).concat(vm.movement.description);
  //       return Stock.movements.create(movement);
  //     })
  //     .then(document => {
  //       documentUuid = document.uuid;

  //       // update requisition status if needed
  //       if (!vm.requisition.uuid) { return null; }

  //       const movementRequisition = {
  //         stock_requisition_uuid : vm.requisition.uuid,
  //         document_uuid : documentUuid,
  //       };

  //       const COMPLETED_STATUS = bhConstants.stockRequisition.completed_status;
  //       return Stock.stockRequisition.update(vm.requisition.uuid, {
  //         status_id : COMPLETED_STATUS,
  //         movementRequisition,
  //       });
  //     })
  //     .then(() => {
  //       ReceiptModal.stockExitServiceReceipt(documentUuid, bhConstants.flux.TO_SERVICE);
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

  // // submit loss
  // function submitLoss(form) {
  //   const movement = {
  //     depot_uuid : vm.stockForm.depot.uuid,
  //     entity_uuid : vm.movement.entity.uuid,
  //     date : vm.movement.date,
  //     description : vm.movement.description,
  //     is_exit : 1,
  //     flux_id : bhConstants.flux.TO_LOSS,
  //     user_id : vm.stockForm.details.user_id,
  //   };

  //   const lots = vm.stockForm.store.data.map(formatLot);

  //   movement.lots = lots;

  //   return Stock.movements.create(movement)
  //     .then(document => {

  //       if (document.uuid) {
  //         ReceiptModal.stockExitLossReceipt(document.uuid, bhConstants.flux.TO_LOSS);
  //         reinit(form);
  //       }
  //     })
  //     .catch(Notify.handleError);
  // }

  startup();
}

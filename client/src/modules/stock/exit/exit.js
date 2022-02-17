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
  Notify, Session, util, bhConstants, ReceiptModal,
  StockForm, Stock, StockModal, uiGridConstants, $translate,
  GridExportService, Store, Barcode,
) {
  const vm = this;

  vm.stockForm = new StockForm('StockExit');

  vm.gridApi = {};
  vm.ROW_ERROR_FLAG = bhConstants.grid.ROW_ERROR_FLAG;
  vm.DATE_FMT = bhConstants.dates.format;
  vm.overconsumption = [];

  // bind methods
  vm.maxLength = util.maxLength;
  vm.enterprise = Session.enterprise;

  vm.configureItem = () => {};
  vm.onSelectExitType = onSelectExitType;
  vm.submit = submit;
  vm.getLotByBarcode = getLotByBarcode;

  const gridFooterTemplate = `
    <div style="margin-left: 10px;">
      {{ grid.appScope.gridApi.core.getVisibleRows().length }}
      <span translate>STOCK.ROWS</span>
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

  function submit(form) {
    if (form.$invalid) { return null; }

    const checkOverconsumption = vm.stockForm.store.data;

    checkOverconsumption.forEach(stock => {
      stock.quantityAvailable = 0;

      vm.currentInventories.forEach(lot => {
        if (lot.uuid === stock.lot.uuid) {
          stock.quantityAvailable = lot.quantity;
        }
      });
    });

    vm.overconsumption = checkOverconsumption.filter(c => c.quantity > c.quantityAvailable);

    if (vm.overconsumption.length) {
      vm.overconsumption.forEach(item => {
        item.textI18n = {
          text : item.inventory.text,
          label : item.lot.label,
          quantityAvailable : item.quantityAvailable,
          quantity : item.quantity,
          unit_type : item.inventory.unit_type,
        };
      });

      Notify.danger('ERRORS.ER_PREVENT_NEGATIVE_QUANTITY_IN_EXIT_STOCK');
      vm.$loading = false;
      return 0;
    }

    // if (vm.movement.exit_type !== 'loss' && expiredLots()) {
    //   // NOTE: This check may not be necessary, since the user cannot select
    //   //       expired lots/batches directly.  But lots can also come in via
    //   //       Invoices(Patient) or Requisions(Service/Depot), so it seems
    //   //       prudent to check again here.
    //   return Notify.danger('ERRORS.ER_EXPIRED_STOCK_LOTS');
    // }

    if (!vm.movement.entity.uuid && vm.movement.entity.type !== 'loss') {
      return Notify.danger('ERRORS.ER_NO_STOCK_DESTINATION');
    }

    if (vm.stockForm.hasDuplicatedLots()) {
      return Notify.danger('ERRORS.ER_DUPLICATED_LOT', 20000);
    }

    vm.$loading = true;

    return null;

    // return mapExit[vm.movement.exit_type].submit(form)
    //   .catch(Notify.handleError)
    //   .finally(() => { vm.$loading = false; });
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

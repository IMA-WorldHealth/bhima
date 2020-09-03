angular.module('bhima.controllers')
  .controller('StockFindDonationModalController', StockFindDonationModalController);

StockFindDonationModalController.$inject = [
  '$uibModalInstance', 'DonationService', 'NotifyService',
  'uiGridConstants', 'GridFilteringService', 'ReceiptModal',
  'bhConstants', 'DonorService', 'util', 'StockFormService', 'Store', 'InventoryService',
];

function StockFindDonationModalController(
  Instance, Donation, Notify, uiGridConstants, Filtering,
  Receipts, bhConstants, Donor, util, StockForm, Store, Inventory,
) {
  const vm = this;
  vm.showAddDonation = false;
  // global
  vm.selectedRow = {};
  vm.donation = {};
  vm.donors = [];
  vm.maxLength = util.maxLength;
  let inventoryStore;

  /* ======================= Grid configurations ============================ */
  vm.filterEnabled = false;
  vm.gridOptions = { appScopeProvider : vm };

  const filtering = new Filtering(vm.gridOptions);
  vm.stockForm = new StockForm('Donation');

  const columns = [
    {
      field            : 'reference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      headerCellFilter : 'translate',
      cellTemplate     : 'modules/stock/entry/modals/templates/donation_reference.tmpl.html',
    },

    {
      field            : 'date',
      cellFilter       : 'date:"'.concat(bhConstants.dates.format, '"'),
      filter           : { condition : filtering.filterByDate },
      displayName      : 'TABLE.COLUMNS.DATE',
      headerCellFilter : 'translate',
      sort             : { priority : 0, direction : 'desc' },
    },

    {
      field            : 'display_name',
      displayName      : 'TREE.DONOR',
      headerCellFilter : 'translate',
    },
    {
      field            : 'project_name',
      displayName      : 'FORM.LABELS.PROJECT',
      headerCellFilter : 'translate',
    },
    {
      field            : 'description',
      displayName      : 'FORM.LABELS.DESCRIPTION',
      headerCellFilter : 'translate',
    },
  ];

  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.multiSelect = false;
  vm.gridOptions.enableFiltering = vm.filterEnabled;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.toggleFilter = toggleFilter;
  vm.setInitialized = setInitialized;
  vm.buildStockLine = buildStockLine;
  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.showReceipt = showReceipt;

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  function rowSelectionCallback(row) {
    vm.selectedRow = row.entity;
  }

  /** toggle filter */
  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /** get donation document */
  function showReceipt(uuid) {
    Receipts.purchase(uuid);
  }

  function init() {
    load();
    loadInventories();
    Donor.read().then(donors => {
      vm.donors = donors;
    });
  }

  /* ======================= End Grid ======================================== */
  function load() {
    vm.loading = true;
    Donation.read()
      .then(donations => {
        vm.gridOptions.data = donations;
      })
      .catch(() => {
        vm.hasError = true;
      })
      .finally(() => {
        vm.loading = false;
      });
  }

  vm.toggleAddDonation = () => {
    vm.showAddDonation = !vm.showAddDonation;
  };

  // submit
  function submit(form) {

    if (!vm.showAddDonation) {
      if (!vm.selectedRow || (vm.selectedRow && !vm.selectedRow.uuid)) { return null; }
      Donation.stockBalance(vm.selectedRow.uuid).then(donations => {
        return Instance.close([].concat(donations));
      });
      return true;
    }
    const itemsValid = hasValidInput();
    if (form.$invalid || !itemsValid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return false;
    }

    Donation.create({
      donation : vm.donation,
      items : vm.stockForm.store.data.map(line => {
        return {
          inventory_uuid : line.inventory_uuid,
          quantity : line.quantity,
          unit_price : line.unit_price,
        };
      }),
    })
      .then((result) => {
        Notify.success('FORM.INFO.OPERATION_SUCCESS');
        return Donation.stockBalance(result.uuid);
      }).then(donations => {
        return Instance.close(donations);
      })
      .catch(Notify.handleError);
    return 0;
  }
  // cancel
  function cancel() {
    Instance.close();
  }

  vm.onSelectProject = (project) => {
    vm.donation.project_id = project.id;
  };

  vm.onDateChange = (date) => {
    vm.donation.date = date;
  };

  // add donation grid
  const newDonationCol = [{
    field : 'status',
    width : 25,
    displayName : '',
    cellTemplate : 'modules/purchases/create/templates/status.tmpl.html',
  }, {
    field : 'code',
    width : 150,
    displayName : 'TABLE.COLUMNS.CODE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/stock/entry/templates/code.tmpl.html',
  }, {
    field : 'description',
    displayName : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/stock/entry/templates/description.tmpl.html',
  }, {
    field : 'quantity',
    width : 150,
    displayName : 'TABLE.COLUMNS.QUANTITY',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/quantity.tmpl.html',
  }, {
    field : 'unit_price',
    width : 100,
    displayName : 'FORM.LABELS.UNIT_PRICE',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/price.tmpl.html',
  }, {
    field : 'amount',
    width : 150,
    displayName : 'TABLE.COLUMNS.AMOUNT',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/purchases/create/templates/amount.tmpl.html',
  }, {
    field : 'actions',
    width : 50,
    cellTemplate : 'modules/stock/entry/templates/actions.tmpl.html',
  }];

  // grid options for the purchase order grid
  vm.newDonationGridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : newDonationCol,
    onRegisterApi(gridApi) {
      vm.gridApi2 = gridApi;
    },
    data : vm.stockForm.store.data,
  };

  /**
   * @method addItems
   * @param {number} n
   * @description [grid] add n items (rows) in the grid and call a validation function on each rows
   */
  vm.addItems = (n) => {
    vm.stockForm.addItems(n);
  };

  /**
   * @method setupStock
   * @description [grid] setup the grid and clear all previous values
   */
  function setupStock() {
    vm.stockForm.setup();
    vm.stockForm.store.clear();
  }

  /**
   * @method loadInventories
   * @description load inventories
   */
  function loadInventories() {
    setupStock();

    Inventory.read()
      .then((inventories) => {
        vm.inventories = inventories;
        inventoryStore = new Store({ identifier : 'uuid', data : inventories });
      })
      .catch(Notify.handleError);
  }
  /**
   * @method setInitialized
   * @param {object} item
   * @description [grid] set initialized to true on the passed item
   */
  function setInitialized(item) {
    item._initialised = true;
  }
  /**
   * @method removeItem
   * @param {number} index
   * @description [grid] remove the row with the given index and call a validation function on each remaining rows
   */
  vm.removeItem = (index) => {
    vm.stockForm.removeItem(index);
    // vm.hasValidInput = hasValidInput();
  };

  /**
   * @function hasValidInput
   * @description [grid] check if all rows in the grid have lots defined
   */
  function hasValidInput() {
    const rows = vm.stockForm.store.data;
    const validData = rows.filter(line => line._valid);
    return (validData.length === rows.length) && rows.length > 0;
  }

  /**
   * @method buildStockLine
   * @param {object} line
   * @description [grid] initialize each cell of defined rows with value
   */
  function buildStockLine(line) {
    const inventory = inventoryStore.get(line.inventory_uuid);
    line.code = inventory.code;
    line.label = inventory.label;
    line.unit_cost = inventory.price;
    line.quantity = 0;
    line.cost = line.quantity * line.unit_cost;
    line.expiration_date = new Date();
    line.unit = inventory.unit;
    line.tracking_expiration = inventory.tracking_expiration;
    setInitialized(line);
  }

  vm.handleChange = () => {
    vm.stockForm.store.data.forEach(item => {
      item._valid = item.quantity && item.unit_price;
    });
  };

  init();
}

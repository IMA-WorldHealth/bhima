angular.module('bhima.services')
.service('StockEntryExitTypeService', StockEntryExitTypeService);

StockEntryExitTypeService.$inject = [];

function StockEntryExitTypeService() {
  var service = this;

  var entryExitTypeList = [
    { label : 'patient',
      labelKey : 'PATIENT_REG.ENTITY',
      descriptionKey : 'STOCK.PATIENT_DISTRIBUTION',
      isEntry : false,
      allowedKey : 'allow_exit_debtor' },

    { label : 'service',
      labelKey : 'SERVICE.ENTITY',
      descriptionKey : 'STOCK.SERVICE_DISTRIBUTION',
      isEntry : false,
      allowedKey : 'allow_exit_service' },

    { label : 'depot',
      labelKey : 'DEPOT.ENTITY',
      descriptionKey : 'STOCK.DEPOT_DISTRIBUTION',
      isEntry : false,
      allowedKey : 'allow_exit_transfer' },

    { label : 'loss',
      labelKey : 'STOCK.EXIT_LOSS',
      descriptionKey : 'STOCK.LOSS_DISTRIBUTION',
      isEntry : false,
      allowedKey : 'allow_exit_loss' },

    { label : 'purchase',
      labelKey : 'STOCK.ENTRY_PURCHASE',
      descriptionKey : 'STOCK_FLUX.FROM_PURCHASE',
      isEntry : true,
      allowedKey : 'allow_entry_purchase' },

    { label : 'integration',
      labelKey : 'STOCK.INTEGRATION',
      descriptionKey : 'STOCK_FLUX.FROM_INTEGRATION',
      isEntry : true,
      allowedKey : 'allow_entry_integration' },

    { label : 'donation',
      labelKey : 'STOCK.DONATION',
      descriptionKey : 'STOCK_FLUX.FROM_DONATION',
      isEntry : true,
      allowedKey : 'allow_entry_donation' },

    { label : 'transfer_reception',
      labelKey : 'STOCK.RECEPTION_TRANSFER',
      descriptionKey : 'STOCK_FLUX.FROM_TRANSFER',
      isEntry : true,
      allowedKey : 'allow_entry_transfer' },
  ];

  service.getAllowedTypes = getAllowedTypes;

  service.getEntryTypeList = function getEntryTypeList() {
    return filterByEntry(true);
  };

  service.getExitTypeList = function getExitTypeList() {
    return filterByEntry(false);
  };

  /**
   * @function getAllowedTypes
   *
   * @description
   * return allowed entry/exit feature for a given depot
   *
   * @param {object} depot
   */
  function getAllowedTypes(depot) {
    if (!depot || !depot.uuid) { return []; }

    return entryExitTypeList.map(function (item) {
      item.isAllowed = depot[item.allowedKey];
      return item;
    });
  }

  /**
   * @function filterByEntry
   *
   * @description
   * filter the Entry/Exit types list according the isEntry attribute
   * is true or false
   *
   * @param {boolean} isEntry
   */
  function filterByEntry(isEntry) {
    return entryExitTypeList.filter(function (item) {
      return item.isEntry === isEntry;
    });
  }
}

angular.module('bhima.services')
  .service('StockEntryExitTypeService', StockEntryExitTypeService);

function StockEntryExitTypeService() {
  const service = this;

  service.exitTypes = [{
    label : 'patient',
    labelKey : 'PATIENT_REG.ENTITY',
    descriptionKey : 'STOCK.PATIENT_DISTRIBUTION',
    allowedKey : 'allow_exit_debtor',
  }, {
    label : 'service',
    labelKey : 'SERVICE.ENTITY',
    descriptionKey : 'STOCK.SERVICE_DISTRIBUTION',
    allowedKey : 'allow_exit_service',
  }, {
    label : 'depot',
    labelKey : 'DEPOT.ENTITY',
    descriptionKey : 'STOCK.DEPOT_DISTRIBUTION',
    allowedKey : 'allow_exit_transfer',
  }, {
    label : 'loss',
    labelKey : 'STOCK.EXIT_LOSS',
    descriptionKey : 'STOCK.LOSS_DISTRIBUTION',
    allowedKey : 'allow_exit_loss',
  }];

  service.entryTypes = [{
    label : 'purchase',
    labelKey : 'STOCK.ENTRY_PURCHASE',
    descriptionKey : 'STOCK_FLUX.FROM_PURCHASE',
    allowedKey : 'allow_entry_purchase',
  }, {
    label : 'integration',
    labelKey : 'STOCK.INTEGRATION',
    descriptionKey : 'STOCK_FLUX.FROM_INTEGRATION',
    allowedKey : 'allow_entry_integration',
  }, {
    label : 'donation',
    labelKey : 'STOCK.DONATION',
    descriptionKey : 'STOCK_FLUX.FROM_DONATION',
    allowedKey : 'allow_entry_donation',
  }, {
    label : 'transfer_reception',
    labelKey : 'STOCK.RECEPTION_TRANSFER',
    descriptionKey : 'STOCK_FLUX.FROM_TRANSFER',
    allowedKey : 'allow_entry_transfer',
  }];
}

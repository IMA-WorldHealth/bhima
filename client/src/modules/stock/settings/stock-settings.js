angular.module('bhima.controllers')
  .controller('StockSettingsController', StockSettingsController);

StockSettingsController.$inject = [
  // 'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'LanguageService',
  // 'GridGroupingService', 'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
  // 'BarcodeService', 'LotService', 'LotsRegistryService', 'moment',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockSettingsController(
  // Stock, Notify, uiGridConstants, Modal, Languages,
  // Grouping, GridState, Columns, $state, $httpParamSerializer,
  // Barcode, LotService, LotsRegistry, moment,
) {
  const vm = this;
  console.log("Started StockSettingsController!");
}

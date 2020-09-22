angular.module('bhima.controllers')
  .controller('StockSettingsCtrl', StockSettingsCtrl);

StockSettingsCtrl.$inject = [
  // 'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'LanguageService',
  // 'GridGroupingService', 'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
  // 'BarcodeService', 'LotService', 'LotsRegistryService', 'moment',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockSettingsCtrl(
  // Stock, Notify, uiGridConstants, Modal, Languages,
  // Grouping, GridState, Columns, $state, $httpParamSerializer,
  // Barcode, LotService, LotsRegistry, moment,
) {
  const vm = this;
  console.log("Started StockSettingsController!");
}

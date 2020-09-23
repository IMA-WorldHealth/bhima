angular.module('bhima.controllers')
  .controller('StockSettingsController', StockSettingsController);

StockSettingsController.$inject = [
  'EnterpriseService', 'util', 'NotifyService',
  // 'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'LanguageService',
  // 'GridGroupingService', 'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
  // 'BarcodeService', 'LotService', 'LotsRegistryService', 'moment',
];

/**
 * Stock lots Controller
 * This module is a registry page for stock lots
 */
function StockSettingsController(
  Enterprises, util, Notify,
  // Stock, uiGridConstants, Modal, Languages,
  // Grouping, GridState, Columns, $state, $httpParamSerializer,
  // Barcode, LotService, LotsRegistry, moment,
) {
  const vm = this;

  vm.enterprise = {};
  vm.hasEnterprise = false;

  let $touched = false;

  // bind methods
  vm.submit = submit;

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return 0;
    }

    // make sure only fresh data is sent to the server.
    if (form.$pristine && !$touched && !vm.hasThumbnail) {
      Notify.warn('FORM.WARNINGS.NO_CHANGES');
      return 0;
    }

    // const creation = (vm.hasEnterprise === false);
    // const changes = util.filterFormElements(form, true);

    // Object.keys(vm.enterprise.settings).forEach(key => {
    //   delete changes[key];
    // });

    // changes.settings = angular.copy(vm.enterprise.settings);

    // const promise = (creation)
    //   ? Enterprises.create(changes)
    //   : Enterprises.update(vm.enterprise.id, changes);

    // return promise
    //   .then(() => Notify.success(creation ? 'FORM.INFO.SAVE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS'))
    //   .then(() => Session.reload())
    //   .catch(Notify.handleError);

    return 1;
  }

  /**
     * @function proxy
     *
     * @description
     * Proxies requests for different enterprise settings.
     *
     * @returns {function}
     */
  function proxy(key) {
    return (enabled) => {
      vm.enterprise.settings[key] = enabled;
      $touched = true;
    };
  }

  vm.enableAutoStockAccountingSetting = proxy('enable_auto_stock_accounting');
  vm.enableAutoPurchaseOrderConfirmationSetting = proxy('enable_auto_purchase_order_confirmation');
  vm.enableDailyConsumptionSetting = proxy('enable_daily_consumption');
  vm.setMonthAverage = function setMonthAverage() {
    $touched = true;
  };
  vm.setDefaultMinMonthsSecurityStock = function setDefaultMinMonthsSecurityStock() {
    $touched = true;
  };

}

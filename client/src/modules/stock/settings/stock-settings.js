angular.module('bhima.controllers')
  .controller('StockSettingsController', StockSettingsController);

StockSettingsController.$inject = [
  'StockSettingsService', 'EnterpriseService', 'util', 'NotifyService', 'SessionService',
  // 'StockService', 'NotifyService', 'uiGridConstants', 'StockModalService', 'LanguageService',
  // 'GridGroupingService', 'GridStateService', 'GridColumnService', '$state', '$httpParamSerializer',
  // 'BarcodeService', 'LotService', 'LotsRegistryService', 'moment',
];

/**
 * Stock Settings Controller
 * This module is a for getting/updating the parameters/settings related to Stock
 */
function StockSettingsController(
  StockSettings, Enterprises, util, Notify, Session,
  // Stock, uiGridConstants, Modal, Languages,
  // Grouping, GridState, Columns, $state, $httpParamSerializer,
  // Barcode, LotService, LotsRegistry, moment,
) {
  const vm = this;

  vm.enterprise = {};
  vm.hasEnterprise = false;
  vm.hasSettings = false;
  vm.settings = {};

  let $touched = false;

  // bind methods
  vm.submit = submit;

  // fired on startup
  function startup() {

    // load enterprises
    Enterprises.read()
      .then(enterprises => {
        vm.hasEnterprise = (enterprises.length > 0);
        vm.enterprises = vm.hasEnterprise ? enterprises : [];
        vm.enterprise = vm.hasEnterprise ? vm.enterprises[0] : {};

        // Now look up (or create) the stock settings
        StockSettings.read(null, { 'enterprise_id': vm.enterprise.id })
          .then(settings => {
            if (settings.length > 0) {
              vm.settings = settings[0];
            } else {
              console.log("Creating...");
              StockSettings.create({ 'enterprise_id': vm.enterprise_id })
                .then(settings => {
                  vm.settings = settings[0];
                });
            }
          });
      })
      .catch(Notify.handleError);
  }

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return 0;
    }

    // make sure only fresh data is sent to the server.
    if (form.$pristine && !$touched) {
      Notify.warn('FORM.WARNINGS.NO_CHANGES');
      return 0;
    }

    // const creation = (vm.hasEnterprise === false);
    const creation = false; // ???
    const changes = util.filterFormElements(form, true);

    Object.keys(vm.settings).forEach(key => {
      delete changes[key];
    });

    changes.settings = angular.copy(vm.settings);

    // const promise = (creation)
    //   ? Enterprises.create(changes)
    //   : Enterprises.update(vm.enterprise.id, changes);

    const promise = StockSettings.update(vm.enterprise.id, changes);

    return promise
      .then(() => Notify.success(creation ? 'FORM.INFO.SAVE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS'))
      .then(() => Session.reload())
      .catch(Notify.handleError);

    return 1;
  }

  /**
     * @function proxy
     *
     * @description
     * Proxies requests for different stock settings.
     *
     * @returns {function}
     */
  function proxy(key) {
    return (enabled) => {
      vm.settings[key] = enabled;
      $touched = true;
    };
  }

  vm.enableAutoStockAccountingSetting = proxy('enable_auto_stock_accounting');
  vm.enableAutoPurchaseOrderConfirmationSetting = proxy('enable_auto_purchase_order_confirmation');
  vm.enableDailyConsumptionSetting = proxy('enable_daily_consumption');
  vm.enableStrictDepotPermission = proxy('enable_strict_depot_permission');
  vm.enableSupplierCredit = proxy('enable_supplier_credit');
  vm.setMonthAverage = function setMonthAverage() {
    $touched = true;
  };
  vm.setDefaultMinMonthsSecurityStock = function setDefaultMinMonthsSecurityStock() {
    $touched = true;
  };

  startup();
}

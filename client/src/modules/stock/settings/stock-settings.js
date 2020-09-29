angular.module('bhima.controllers')
  .controller('StockSettingsController', StockSettingsController);

StockSettingsController.$inject = [
  'StockSettingsService', 'EnterpriseService', 'util', 'NotifyService', 'SessionService',
];

/**
 * Stock Settings Controller
 * This module is a for getting/updating the parameters/settings related to Stock
 */
function StockSettingsController(
  StockSettings, Enterprises, util, Notify, Session,
) {
  const vm = this;

  vm.enterprise = {};
  vm.settings = {};

  let $touched = false;

  // bind methods
  vm.submit = submit;

  // fired on startup
  function startup() {

    // load enterprises
    Enterprises.read()
      .then(enterprises => {
        // Assume the enterprise data has been created already
        [vm.enterprise] = enterprises;
        const params = { enterprise_id : vm.enterprise.id };

        // Now look up the stock settings
        // (assume they have already been created )
        StockSettings.read(null, params)
          .then(settings => {
            if (settings.length > 0) {
              [vm.settings] = settings;
            }
          })
          .catch(Notify.handleError);
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

    const changes = util.filterFormElements(form, true);
    Object.keys(vm.settings).forEach(key => {
      delete changes[key];
    });
    changes.settings = angular.copy(vm.settings);

    const promise = StockSettings.update(vm.enterprise.id, changes);

    return promise
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => Session.reload()) // Should we just refresh the stock settings in the Session?
      .catch(Notify.handleError);
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

  vm.enableAutoStockAccounting = proxy('enable_auto_stock_accounting');
  vm.enableAutoPurchaseOrderConfirmation = proxy('enable_auto_purchase_order_confirmation');
  vm.enableDailyConsumption = proxy('enable_daily_consumption');
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

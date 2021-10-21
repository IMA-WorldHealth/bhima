angular.module('bhima.controllers')
  .controller('PayrollSettingsController', PayrollSettingsController);

PayrollSettingsController.$inject = [
  'PayrollSettingsService', 'EnterpriseService', 'util', 'NotifyService', 'SessionService', 'bhConstants',
];

/**
 * Payroll Settings Controller
 * This module is a for getting/updating the parameters/settings related to Payroll
 */
function PayrollSettingsController(
  PayrollSettings, Enterprises, util, Notify, Session, bhConstants,
) {
  const vm = this;

  vm.enterprise = {};
  vm.settings = {};

  let $touched = false;

  // bind methods
  vm.submit = submit;
  vm.onSelectCostCenter = onSelectCostCenter;

  // fired on startup
  function startup() {
    console.log('EVERY BODY GOT PRICE');
    console.log(bhConstants.posting_payroll_cost_center);

    // load enterprises
    Enterprises.read()
      .then(enterprises => {
        // Assume the enterprise data has been created already
        [vm.enterprise] = enterprises;
        const params = { enterprise_id : vm.enterprise.id };

        // Now look up the stock settings
        // (assume they have already been created )
        return PayrollSettings.read(null, params);
      })
      .then(settings => {
        if (settings.length > 0) {
          [vm.settings] = settings;
        }
      })
      .catch(Notify.handleError);

    // load type of posting payroll cost center
    vm.postingTypes = bhConstants.posting_payroll_cost_center;

    console.log('NEW_DATA_BASEEEEEEEEEEEE');
    console.log(vm.postingTypes);

  }

  function onSelectCostCenter(cc) {
    const ccKey = 'default_cost_center_for_loss';
    vm.settings[ccKey] = cc.id;
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

    const promise = PayrollSettings.update(vm.enterprise.id, changes);

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

  vm.enableAutoPayrollAccounting = proxy('enable_auto_stock_accounting');
  vm.enableAutoPurchaseOrderConfirmation = proxy('enable_auto_purchase_order_confirmation');
  vm.enableStrictDepotPermission = proxy('enable_strict_depot_permission');
  vm.enableSupplierCredit = proxy('enable_supplier_credit');
  vm.enableStrictDepotDistribution = proxy('enable_strict_depot_distribution');
  vm.enableExpiredPayrollOut = proxy('enable_expired_stock_out');

  vm.setMonthAverage = function setMonthAverage() {
    $touched = true;
  };
  vm.setDefaultMinMonthsSecurityPayroll = function setDefaultMinMonthsSecurityPayroll() {
    $touched = true;
  };

  vm.setMinDelay = () => { $touched = true; };

  vm.setPurchaseInterval = () => { $touched = true; };

  startup();
}

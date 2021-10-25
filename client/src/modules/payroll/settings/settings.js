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

  // fired on startup
  function startup() {
    // load enterprises
    Enterprises.read(null, { detailed : 1 })
      .then(enterprises => {
        // Assume the enterprise data has been created already
        [vm.enterprise] = enterprises;
      })
      .catch(Notify.handleError);

    // load Posting Payroll Cost Center Mode
    vm.postingPayrollCostCenterMode = bhConstants.posting_payroll_cost_center;
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

    const changes = {};

    changes.settings = angular.copy(vm.enterprise.settings);
    const promise = Enterprises.update(vm.enterprise.id, changes);

    return promise
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => Session.reload()) //
      .catch(Notify.handleError);
  }

  /**
     * @function proxy
     *
     * @description
     * Proxies requests for different payroll settings.
     *
     * @returns {function}
     */
  function proxy(key) {
    return (enabled) => {
      vm.enterprise.settings[key] = enabled;
      $touched = true;
    };
  }

  vm.enableIndexPaymentSetting = proxy('enable_index_payment_system');

  startup();
}

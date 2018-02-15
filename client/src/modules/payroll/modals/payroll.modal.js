angular.module('bhima.controllers')
  .controller('PayrollConfigurationModalController', PayrollConfigurationModalController);

PayrollConfigurationModalController.$inject = [
  '$state', 'PayrollConfigurationService', 'NotifyService', 'appcache', 'moment',
];

function PayrollConfigurationModalController($state, PayrollConfigurations, Notify, AppCache, moment) {
  var vm = this;
  vm.payroll = {};

  var cache = AppCache('PayrollModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.onSelectRubricConfig = onSelectRubricConfig;
  vm.onSelectAccountConfig = onSelectAccountConfig;

  if (!vm.isCreating) {
    PayrollConfigurations.read(vm.stateParams.id)
      .then(function (payroll) {

        payroll.dateFrom = new Date(payroll.dateFrom);
        payroll.dateTo = new Date(payroll.dateTo);
        vm.payroll = payroll;
      })
      .catch(Notify.handleError);
  }

  // callback for Rubric Configuration select
  function onSelectRubricConfig(rubric) {
    vm.payroll.config_rubric_id = rubric.id;
  }

  // callback for Account Configuration select
  function onSelectAccountConfig(account) {
    vm.payroll.config_accounting_id = account.id;
  }

  // submit the data to the server from all two forms (update, create)
  function submit(payrollForm) {
    var promise;

    if (payrollForm.$invalid) { return 0; }

    vm.payroll.dateFrom = moment(vm.payroll.dateFrom).format('YYYY-MM-DD');
    vm.payroll.dateTo = moment(vm.payroll.dateTo).format('YYYY-MM-DD');

    promise = (vm.isCreating) ?
      PayrollConfigurations.create(vm.payroll) :
      PayrollConfigurations.update(vm.payroll.id, vm.payroll);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('payroll', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
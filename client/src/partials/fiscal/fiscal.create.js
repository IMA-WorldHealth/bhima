angular.module('bhima.controllers')
  .controller('FiscalCreateController', FiscalCreateController);

FiscalCreateController.$inject = [
  '$state', 'FiscalService', 'NotifyService', 'util', 'moment'
];

/**
 * This controller is responsible for creating a fiscal year. It provides
 * utility functions for submission and error handling.
 *
 * @module fiscal/create
 */
function FiscalCreateController($state, Fiscal, Notify, util, moment) {
  var vm = this;

  vm.fiscal = {};
  vm.endDate = endDate;
  vm.submit = submit;

  vm.maxLength = util.maxTextLength;

  function endDate() {
    var start_date = new Date(vm.fiscal.start_date);
    vm.end_date = new Date(moment(start_date).month(vm.fiscal.number_of_months));
  }

  function submit(form) {

    // ensure all Angular form validation checks have passed
    if (form.$invalid) {
       Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // Get the previous fiscal Year By Date
    return Fiscal.fiscalYearDate({date : vm.fiscal.start_date})
      .then(function (previous) {
        if (previous.length) {
          vm.fiscal.previous_fiscal_year_id = previous[0].fiscal_year_id;
        }

        var cp = angular.copy(vm.fiscal);
        return Fiscal.create(cp);
      })
      .then(function () {
        Notify.success('FORM.INFO.CREATE_SUCCESS');

        // navigate back to list view
        $state.go('fiscal.list', null, {reload : true});
      })
      .catch(Notify.handleError);
  }
}

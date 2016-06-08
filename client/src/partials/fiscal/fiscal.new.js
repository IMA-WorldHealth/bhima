angular.module('bhima.controllers')
.controller('FiscalCreateController', FiscalCreateController);
FiscalCreateController.$inject = [
    '$state', 'ScrollService', 'FiscalService', 'NotifyService'
];

/**
 * This controller is responsible for creating a debtor group. It provides
 * utility functions for submission and error handling.
 *
 * @todo refactor code to remove redundant features introduced previously
 *
 * @module fiscal/new
 */
function FiscalCreateController($state, ScrollTo, fiscalService, Notify) {
  var vm = this;
  // expose state for optional view elements
  vm.state   = $state;
  vm.fiscal  = {};
  vm.endDate = endDate;

  function endDate(){
    var start_date = new Date(vm.fiscal.start_date);
    var previousDay;
    vm.end_date = start_date.setMonth(start_date.getMonth() + vm.fiscal.number_of_months);
  }

  function handleException(error) {
    // expose error to view
    vm.exception = error;
  }

  settupDefaults();

  function settupDefaults() {
    vm.submit = submit;
  }

  function submit(fiscal) {    
    var submitFiscal;
    fiscal.$setSubmitted();

    // ensure all Angular form validation checks have passed
    if (fiscal.$invalid || !vm.fiscal.start_date) {
       Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // Get the previous fiscal Year By Date
    fiscalService.fiscalYearDate({date : vm.fiscal.start_date})
    .then(function (previous) {  
      if(previous.length){
        vm.fiscal.previous_fiscal_year_id = previous[0].fiscal_year_id;  
      }
      
      var fiscalSubmit = angular.copy(vm.fiscal);
      
      return fiscalService.create(fiscalSubmit);    
    })
    .then(function (result) {  
      Notify.success('FORM.INFOS.CREATE_SUCCESS');

      // navigate back to list view
      $state.go('fiscal.list', null, {reload : true});      
    })      
    .catch(handleException); 
  }
}

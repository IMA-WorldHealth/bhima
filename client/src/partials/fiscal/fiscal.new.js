angular.module('bhima.controllers')
.controller('FiscalCreateController', FiscalCreateController);
FiscalCreateController.$inject = [
    '$state', 'FiscalService', 'NotifyService', 'util', 'moment'
];

/**
 * This controller is responsible for creating a fiscal year. It provides
 * utility functions for submission and error handling.
 *
 * @module fiscal/new
 */
function FiscalCreateController($state, fiscalService, Notify, util, moment) {
  var vm = this;
  // expose state for optional view elements
  vm.state   = $state;
  vm.fiscal  = {};
  vm.endDate = endDate;
  vm.submit = submit;

  vm.maxLength = util.maxTextLength; 

  function endDate(){
    var start_date = new Date(vm.fiscal.start_date);
    var previousDay;

    vm.end_date = new Date(moment(start_date).month(vm.fiscal.number_of_months));
  }

  function submit(fiscal) {    
    fiscal.$setSubmitted();

    // ensure all Angular form validation checks have passed
    if (fiscal.$invalid) {
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
    .catch(Notify.handleError); 
  }
}

angular.module('bhima.controllers')
.controller('FiscalController', FiscalController);

FiscalController.$inject = ['$state', 'FiscalService', '$interval', 'ModalService', 'NotifyService'];

function FiscalController($state, fiscalService, $interval, ModalService, Notify) {
  var vm = this;
  var today = new Date(); 

  // pagination configuration
  /** @todo this should all be moved to a component */
  vm.pageSize     = 5;
  vm.currentPage  = 1;
  vm.fiscalYears  = [];
  vm.maxSize      = 5;
  vm.del          = del;

  vm.sort = sort;
  vm.state = $state;

  vm.sortByName = "ASC";
  vm.sortByDateCreated = "ASC";
  vm.sortByNumbrerOfMonth = "ASC";

  // refreshFiscalYear
  function refreshFiscalYear(){
    return fiscalService.read(null,{ detailed : 1 })
    .then(function (fiscalYears) {

      vm.fiscalYears = fiscalYears;
    });
  }

  // Get the fiscal Year By Date
  fiscalService.fiscalYearDate({date : today})
  .then(function (current) {
    vm.current = current;
  })
  .catch(Notify.handleError);

  // switch to delete warning mode
  function del(fiscal) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool){
       // if the user clicked cancel, reset the view and return
      if (!bool) {
        return;
      }

      fiscalService.delete(fiscal.id)
      .then(function () {
        Notify.success('FORM.INFOS.DELETE_SUCCESS');
        return refreshFiscalYear()
      })
      .catch(function (error) {
        Notify.danger('FISCAL.CAN_NOT_DELETE_FY');
      });
    });  
  }

  function sort(option){
    vm.sorted = option.by;
    option.detailed = 1;

    if(option.by === "label" && option.order === "ASC"){
      vm.sortByName = "DESC";
      vm.nameDesc = "up";
    } else if(option.by === "label" && option.order === "DESC"){
      vm.sortByName = "ASC";
      vm.nameDesc = "down";
    }

    if(option.by === "created_at" && option.order === "ASC"){
      vm.sortByDateCreated = "DESC";
      vm.dateDesc = "up";
    } else if(option.by === "created_at" && option.order === "DESC"){
      vm.sortByDateCreated = "ASC";
      vm.dateDesc = "down";
    }

    if(option.by === "number_of_months" && option.order === "ASC"){
      vm.sortByNumbrerOfMonth = "DESC";
      vm.nbMonthDesc = "up";
    } else if(option.by === "number_of_months" && option.order === "DESC"){
      vm.sortByNumbrerOfMonth = "ASC";
      vm.nbMonthDesc = "down";
    }

    fiscalService.read(null, option)
    .then(function (fiscalYears) {
      vm.fiscalYears = fiscalYears;
    })
    .catch(Notify.handleError);
  }
  refreshFiscalYear();

}

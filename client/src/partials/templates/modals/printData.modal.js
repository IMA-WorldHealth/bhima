angular.module('bhima.controllers')
.controller('PrintDataModalController', PrintDataModalController);

// dependencies injection
PrintDataModalController.$inject = ['SessionService', '$uibModalInstance', 'data'];

/**
 * Print Data Modal Controller
 * This controller is responsible of formating array of data in a simple modal
 * page for printing
 */
function PrintDataModalController(Session, Instance, Data) {
  var vm = this;

  // data required variables
  vm.dataTitle = Data.title;
  vm.dataHeaders = Data.headers;
  vm.dataRows = Data.rows;

  // enterprise header data
  vm.enterprise = Session.enterprise;
  vm.project = Session.project;

  // Instance manipulation
  vm.cancel = function cancel() {
    Instance.dismiss('cancel');
  };

  vm.print = function () {
    print();
    Instance.close();
  }


}

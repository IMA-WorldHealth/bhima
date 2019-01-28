angular.module('bhima.controllers')
  .controller('HistoricModalController', HistoricModalController);

// dependencies injections
HistoricModalController.$inject = [
  'LotService', '$uibModalInstance', 'NotifyService', 'data',
];

function HistoricModalController(Lots, Instance, Notify, Data) {
  const vm = this;
  vm.model = {};
  vm.cancel = Instance.dismiss;

  function startup() {
    // lot details
    Lots.read(Data.uuid)
      .then(lot => {
        vm.lot = lot;
      })
      .catch(Notify.handleError);

    // assignments details
    Lots.assignments(Data.uuid, Data.depotUuid)
      .then(assignments => {
        vm.lotAssignments = assignments;
      })
      .catch(Notify.handleError);
  }

  startup();
}

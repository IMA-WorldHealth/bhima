angular.module('bhima.controllers')
  .controller('DuplicateLotsModalController', DuplicateLotsModalController);

// dependencies injections
DuplicateLotsModalController.$inject = [
  'data', '$state', '$uibModalInstance', 'LotService', 'NotifyService',
  // 'util', 'Store', 'PeriodService', 'StockService',
  // 'SearchModalUtilService',
];

function DuplicateLotsModalController(data, $state, Instance, Lots, Notify) {
  // util, Store, Periods, Stock, SearchModal
  const vm = this;
  vm.selectedLot = null;
  vm.lots = [];
  vm.selectLot = selectLot;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.selectedLot = null;

  function startup() {
    Lots.read(data.uuid)
      .then(selectedLot => {
        vm.selectedLot = selectedLot;
        // Search for duplicate lots
        Lots.dupes({ label : vm.selectedLot.label })
          .then(lots => {
            lots.forEach(lot2 => {
              lot2.selected = lot2.uuid === vm.selectedLot.uuid;
              lot2.merge = false;
            });
            vm.lots = lots;
            console.log("UUID: ", data.uuid);
            console.log('LOTS0: ', vm.lots);
          });
      })
      .catch(Notify.handleError);
  }

  function selectLot(sLot) {
    vm.selectedLot = sLot;
    vm.lots.forEach(lot => {
      lot.selected = lot.uuid === sLot.uuid;
      if (lot.uuid === sLot.uuid) {
        lot.merge = false;
      }
    });
  }

  function cancel() {
    Instance.close('cancel');
  }

  function submit(form) {
    // ??? console.log('SUBMIT');
    if (form.$invalid) { return; }

    //   ???
    console.log('LOTS: ', vm.lots);
    Notify.success('LOTS.SUCCESSFULLY_MERGED_N_LOTS');

    Instance.close();
  }

  startup();
}

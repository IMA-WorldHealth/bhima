angular.module('bhima.controllers')
  .controller('DuplicateLotsModalController', DuplicateLotsModalController);

// dependencies injections
DuplicateLotsModalController.$inject = [
  'data', '$state', '$uibModalInstance', 'LotService', 'NotifyService', '$translate',
  // 'util', 'Store', 'PeriodService', 'StockService',
  // 'SearchModalUtilService',
];

function DuplicateLotsModalController(data, $state, Instance, Lots, Notify, $translate) {
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
        Lots.dupes({ label : vm.selectedLot.label, inventory_uuid : vm.selectedLot.inventory_uuid })
          .then(lots => {
            lots.forEach(lot2 => {
              lot2.selected = lot2.uuid === vm.selectedLot.uuid;
              lot2.merge = false;
            });
            vm.lots = lots;
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
    if (form.$invalid) { return; }

    // Collect the lots to be merged
    const lotsToMerge = [];
    vm.lots.forEach(lot => {
      if (lot.merge) {
        lotsToMerge.push(lot.uuid);
      }
    });
    if (lotsToMerge.length === 0) {
      Notify.warn($translate.instant('LOTS.NO_LOTS_MERGED'));
    } else {
      Lots.merge(vm.selectedLot.uuid, lotsToMerge);
      Notify.success($translate.instant('LOTS.MERGED_N_LOTS', { N : lotsToMerge.length }));
    }
    Instance.close();
  }

  startup();
}

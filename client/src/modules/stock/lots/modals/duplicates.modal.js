angular.module('bhima.controllers')
  .controller('DuplicateLotsModalController', DuplicateLotsModalController);

// dependencies injections
DuplicateLotsModalController.$inject = [
  'data', '$uibModalInstance', 'LotService', 'NotifyService', '$translate',
];

function DuplicateLotsModalController(data, Instance, Lots, Notify, $translate) {
  const vm = this;
  vm.selectedLot = null;
  vm.lots = [];
  vm.selectLot = selectLot;
  vm.selectAll = selectAll;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.selectedLot = null;
  vm.allSelected = false;

  function startup() {
    Lots.read(data.uuid)
      .then(selectedLot => {
        vm.selectedLot = selectedLot;
        return Lots.dupes({ label : vm.selectedLot.label, inventory_uuid : vm.selectedLot.inventory_uuid });
      })
      .then(lots => {
        lots.forEach(lot2 => {
          lot2.selected = lot2.uuid === vm.selectedLot.uuid;
          lot2.merge = false;
        });

        vm.lots = lots;
      })
      .catch(Notify.handleError);
  }

  function selectLot(lotSelected) {
    vm.selectedLot = lotSelected;
    vm.lots.forEach(lot => {
      lot.selected = lot.uuid === lotSelected.uuid;
      lot.merge = false;
    });
  }

  function selectAll() {
    vm.lots.forEach(lot => {
      if (lot.uuid !== vm.selectedLot.uuid) {
        lot.merge = vm.allSelected;
      }
    });
  }

  function cancel() {
    Instance.close('cancel');
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    // Collect the lots to be merged
    const lotsToMerge = vm.lots
      .filter(lot => lot.merge)
      .map(lot => lot.uuid);

    if (lotsToMerge.length === 0) {
      Notify.warn($translate.instant('LOTS.NO_LOTS_MERGED'));
      return Instance.close();
    }

    return Lots.merge(vm.selectedLot.uuid, lotsToMerge)
      .then(() => {
        Notify.success($translate.instant('LOTS.MERGED_N_LOTS', { N : lotsToMerge.length }), 4000);
        Instance.close('success');
      });

  }

  startup();
}

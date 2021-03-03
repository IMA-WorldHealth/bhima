angular.module('bhima.controllers')
  .controller('EditLotModalController', EditLotModalController);

// dependencies injections
EditLotModalController.$inject = [
  'data', 'SessionService', 'LotService', 'InventoryService', 'NotifyService', '$uibModalInstance',
];

function EditLotModalController(Data, Session, Lots, Inventory, Notify, Instance) {
  const vm = this;
  vm.model = {};

  vm.enterprise = Session.enterprise;
  vm.onDateChange = onDateChange;
  vm.onSelectTags = onSelectTags;
  vm.cancel = Instance.dismiss;
  vm.submit = submit;

  vm.trackingExpiration = true;

  function startup() {

    Lots.read(Data.uuid)
      .then(lot => {
        vm.model = lot;
        return Inventory.read(lot.inventory_uuid);
      }).then(inventory => {
        vm.trackingExpiration = inventory.tracking_expiration;
      })
      .catch(Notify.handleError);
  }

  function onDateChange(date) {
    vm.model.expiration_date = date;
  }

  function onSelectTags(tags) {
    vm.model.tags = tags;
  }

  function submit(form) {
    if (form.$invalid) { return; }
    Lots.update(Data.uuid, vm.model)
      .then(() => {
        Notify.success('LOTS.SUCCESSFULLY_EDITED');
        Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  startup();
}

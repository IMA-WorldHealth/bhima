angular.module('bhima.controllers')
  .controller('EditLotModalController', EditLotModalController);

// dependencies injections
EditLotModalController.$inject = [
  'data', 'SessionService', 'LotService', 'NotifyService', '$uibModalInstance',
];

function EditLotModalController(Data, Session, Lots, Notify, Instance) {
  const vm = this;
  vm.model = {};
  vm.enterprise = Session.enterprise;
  vm.onDateChange = onDateChange;
  vm.cancel = Instance.dismiss;
  vm.submit = submit;

  function startup() {
    Lots.read(Data.uuid)
      .then(lot => {
        vm.model = lot;
      })
      .catch(Notify.handleError);
  }

  function onDateChange(date) {
    if (date <= new Date()) { return; }
    vm.model.expiration_date = date;
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

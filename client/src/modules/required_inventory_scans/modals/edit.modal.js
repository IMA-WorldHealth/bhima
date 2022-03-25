angular.module('bhima.controllers')
  .controller('RequiredInventoryScanEditModalController', RequiredInventoryScanEditModalController);

// dependencies injections
RequiredInventoryScanEditModalController.$inject = [
  'data', 'RequiredInventoryScansService',
  'SessionService', 'NotifyService', '$uibModalInstance',
];

function RequiredInventoryScanEditModalController(Data, ReqInvScansService,
  Session, Notify, Instance) {

  const vm = this;

  vm.loading = false;

  vm.model = {};
  vm.today = new Date();

  vm.enterprise = Session.enterprise;
  vm.cancel = Instance.dismiss;
  vm.submit = submit;

  vm.clear = key => {
    delete vm.model[key];
  };

  vm.onSelectDepot = (depot) => {
    vm.model.depot_uuid = depot.uuid;
  };

  vm.onDueDateChange = (date) => {
    vm.model.due_date = date;
  };

  function startup() {
    vm.loading = true;

    if (Data.uuid) {
      ReqInvScansService.details(Data.uuid)
        .then((details) => {
          vm.model = details;
          vm.model.due_date = new Date(details.due_date);
          if (vm.model.is_asset !== null) {
            // Update is_asset to match the html radio element values
            vm.model.is_asset = vm.model.is_asset ? 1 : 2;
          }
        })
        .catch(Notify.handleError)
        .finally(() => {
          vm.loading = false;
        });
    } else {
      vm.model = { };
      if (Data.depot_uuid) {
        vm.model.depot_uuid = Data.depot_uuid;
      }
      vm.loading = false;
    }
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    // Set up is_asset (based on html radio element values)
    if (vm.model.is_asset) {
      vm.model.is_asset = vm.model.is_asset === 1;
    } else {
      vm.model.is_asset = null;
    }

    if (vm.model.uuid) {
      return ReqInvScansService.update(Data.uuid, vm.model)
        .then(() => {
          Notify.success('ASSET.REQUIRED_INVENTORY_SCAN_EDITED');
          Instance.close(true);
        })
        .catch(Notify.handleError);
    }

    return ReqInvScansService.create(vm.model)
      .then(() => {
        // Ignore new UUID return value
        Notify.success('ASSET.REQUIRED_INVENTORY_SCAN_CREATED');
        Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  startup();
}

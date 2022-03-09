angular.module('bhima.controllers')
  .controller('AssetScanEditModalController', AssetScanEditModalController);

// dependencies injections
AssetScanEditModalController.$inject = [
  'data',
  'StockService', 'AssetsScanService', 'AssetsConditionService',
  'SessionService', 'NotifyService', '$uibModalInstance',
];

function AssetScanEditModalController(Data,
  Stock, AssetScans, AssetConditions,
  Session, Notify, Instance) {

  const vm = this;

  vm.loading = false;

  vm.model = {};

  vm.enterprise = Session.enterprise;
  vm.cancel = Instance.dismiss;
  vm.submit = submit;

  vm.clear = key => {
    delete vm.model[key];
  };

  vm.onSelectDepot = (depot) => {
    vm.model.depot_uuid = depot.uuid;
  };

  vm.onSelectScannedBy = (user) => {
    vm.model.scanned_by = user.id;
  };

  vm.onSelectCondition = (cond) => {
    vm.model.condition_id = cond.id;
  };

  function startup() {
    vm.loading = true;
    AssetConditions.list()
      .then(conditions => {
        vm.conditions = conditions;
      })
      .then(() => {
        if (Data.uuid) {
          AssetScans.details(Data.uuid)
            .then(scan => {
              vm.model = scan;
            });
        } else {
          Stock.lots.read(null, { uuid : Data.asset_uuid })
            .then(assets => {
              const asset = assets[0];
              vm.model = {
                asset_uuid : asset.uuid,
                asset_label : asset.label,
                inventory_code : asset.code,
                depot_uuid : asset.depot_uuid,
                depot_text : asset.depot_text,

                manufacturer_brand : asset.manufacturer_brand,
                manufacturer_model : asset.manufacturer_model,
                serial_number : asset.serial_number,

                condition_id : 1,
                scanned_by : Session.user.id,
              };
            });
        }
        return true;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function submit(form) {
    if (form.$invalid) { return 0; }

    if (vm.model.uuid) {
      return AssetScans.update(Data.uuid, vm.model)
        .then(() => {
          Notify.success('ASSET.SCAN_EDITED');
          Instance.close(true);
        })
        .catch(Notify.handleError);
    }

    return AssetScans.create(vm.model)
      .then(() => {
        // Ignore new UUID return value
        Notify.success('ASSET.SCAN_CREATED');
        Instance.close(true);
      })
      .catch(Notify.handleError);
  }

  startup();
}

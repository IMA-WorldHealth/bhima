angular.module('bhima.controllers')
  .controller('DepotModalController', DepotModalController);

DepotModalController.$inject = [
  '$state', 'DepotService', 'NotifyService', 'SessionService', 'params',
];

function DepotModalController($state, Depots, Notify, Session, params) {
  const vm = this;

  vm.depot = {};
  vm.depotRight = [];
  vm.depotLeft = [];

  vm.identifier = params.uuid;
  vm.isCreateState = params.isCreateState;
  vm.enable_strict_depot_distribution = Session.stock_settings.enable_strict_depot_distribution;

  vm.onSelectDepot = onSelectDepot;
  vm.onDistributionDepotChange = onDistributionDepotChange;
  vm.clear = clear;
  vm.submit = submit;

  if (params.parentUuid) {
    vm.depot.parent_uuid = params.parentUuid;
  }

  Depots.read()
    .then(depots => {
      vm.depots = depots;

      let index = 0;
      depots.forEach(depot => {
        if ((vm.identifier && (vm.identifier !== depot.uuid)) || !vm.identifier) {
          const indexCheck = index % 2;
          if (indexCheck === 0) {
            vm.depotRight.push(depot);
          } else if (indexCheck === 1) {
            vm.depotLeft.push(depot);
          }
          index++;
        }
      });
    })
    .catch(Notify.handleError);

  if (!vm.isCreateState) {
    if (!vm.identifier) { return; }
    Depots.read(vm.identifier)
      .then(depot => {
        depot.allowed_distribution_depots.forEach(depotDist => {
          vm.depotRight.forEach(r => {
            if (r.uuid === depotDist) {
              r.checked = 1;
            }
          });

          vm.depotLeft.forEach(l => {
            if (l.uuid === depotDist) {
              l.checked = 1;
            }
          });
        });

        vm.depot = depot;

        // make sure hasLocation is set
        vm.hasLocation = vm.depot.location_uuid ? 1 : 0;

        if (vm.depot.parent === 0) {
          delete vm.depot.parent_uuid;
        }
      })
      .catch(Notify.handleError);
  }

  // if creating, insert the default min_months_security_stock
  if (vm.isCreateState) {
    vm.depot.min_months_security_stock = Session.stock_settings.default_min_months_security_stock;
  }

  function onSelectDepot(depot) {
    vm.depot.parent_uuid = depot.uuid;
  }

  function onDistributionDepotChange(depots) {
    vm.depot.allowed_distribution_depots = depots;
  }

  function clear(item) {
    delete vm.depot[item];
  }

  /**
   * @method submit
   * @param {object} depotForm the form object
   * @description submit the data to the server from all two forms (update, create)
   * @todo check depotForm.$pristine state also for changes in components
   */
  function submit(depotForm) {
    if (depotForm.$invalid) {
      return 0;
    }

    vm.depot.allowed_distribution_depots = [];

    vm.depotRight.forEach(depot => {
      if (depot.checked) vm.depot.allowed_distribution_depots.push(depot.uuid);
    });

    vm.depotLeft.forEach(depot => {
      if (depot.checked) vm.depot.allowed_distribution_depots.push(depot.uuid);
    });

    Depots.clean(vm.depot);

    if (vm.hasLocation === 0) {
      vm.depot.location_uuid = null;
    }

    if (!vm.depot.parent_uuid) {
      vm.depot.parent_uuid = 0;
    }

    const promise = (vm.isCreateState)
      ? Depots.create(vm.depot)
      : Depots.update(vm.depot.uuid, vm.depot);

    return promise
      .then(() => {
        const translateKey = (vm.isCreateState) ? 'DEPOT.CREATED' : 'DEPOT.UPDATED';
        Notify.success(translateKey);
        $state.go('depots', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}

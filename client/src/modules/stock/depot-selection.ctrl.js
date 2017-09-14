angular.module('bhima.controllers')
  .controller('SelectDepotModalController', SelectDepotModalController);

SelectDepotModalController.$inject = [
  '$uibModalInstance', 'DepotService', 'NotifyService', 'depot',
];

/**
 * This modal selects a depot from the list of all depots.
 */
function SelectDepotModalController(Instance, Depots, Notify, depot) {
  var vm = this;

  // bind the depot passed into the controller
  vm.depot = depot;
  vm.selectDepot = selectDepot;
  vm.hasSelectedDepot = hasSelectedDepot;
  vm.loading = false;

  // this is a one-time message shown to the user if they do not have a cached depot.
  vm.hasNoDefaultDepot = !angular.isDefined(depot);

  vm.submit = function submit() { Instance.close(vm.depot); };
  vm.cancel = function cancel() { Instance.dismiss(); };

  // loads a new set of depots from the server.
  function startup() {
    toggleLoadingIndicator();

    Depots.read()
      .then(function (depots) {
        vm.depots = depots;
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }

  // fired when a user selects a depot from a list
  function selectDepot(uuid) {
    var selected;

    vm.depots.forEach(function (d) {
      if (d.uuid === uuid) { selected = d; }
    });

    vm.depot = selected;
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  function hasSelectedDepot() {
    return vm.depot && vm.depot.uuid;
  }

  // start up the module
  startup();
}

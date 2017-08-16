angular.module('bhima.components')
  .component('bhDepotDropdown', {
    bindings : {
      onSelect : '&',
      noServices : '<',
      onlyServices : '<',
    },
    templateUrl  : 'modules/templates/bhDepotDropdown.tmpl.html',
    controller   : bhDepotController,
    controllerAs : '$ctrl',
  });

bhDepotController.$inject = ['DepotService', 'appcache', 'NotifyService'];

function bhDepotController(Depot, AppCache, Notify) {
  var $ctrl = this;

  var cache = new AppCache('bhDepotComponent');

  $ctrl.$onInit = function $onInit() {
    $ctrl.loading = true;

    Depot.read(null, {
      noServices : $ctrl.noServices,
      onlyServices : $ctrl.onlyServices,
    })
    .then(function (rows) {
      if (!rows.length) { return; }
      $ctrl.depots = rows;
      $ctrl.hasDepotsAvailable = !!rows.length;
      $ctrl.selection = cachedDepotExist() ? cache.selection : $ctrl.depots[0];
      $ctrl.onSelect({ depot : $ctrl.selection });
    })
    .catch(Notify.handleError)
    .finally(function () {
      $ctrl.loading = false;
    });
  };

  $ctrl.select = function select(option) {
    $ctrl.selection = option;
    cache.selection = $ctrl.selection;
    $ctrl.onSelect({ depot : $ctrl.selection });
  };

  function cachedDepotExist() {
    if (!cache.selection) { return false; }
    return $ctrl.depots.filter(function (item) {
      return item.uuid === cache.selection.uuid;
    }).length;
  }
}

angular.module('bhima.components')
  .component('bhDepotDropdown', {
    bindings : {
      onSelect : '&',
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

    Depot.read()
    .then(function (rows) {
      if (!rows.length) { return; }
      $ctrl.depots = rows;
      $ctrl.selection = cache.selection || $ctrl.depots[0];
      $ctrl.loading = false;
      $ctrl.onSelect({ depot: $ctrl.selection });
    })
    .catch(Notify.handleError)
    .finally(function () {
      $ctrl.loading = false;
    });
  };

  $ctrl.select = function select(option) {
    $ctrl.selection = option;
    cache.selection = $ctrl.selection;
    $ctrl.onSelect({ depot: $ctrl.selection });
  };
}

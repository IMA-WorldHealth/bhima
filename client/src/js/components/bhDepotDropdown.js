angular.module('bhima.components')
  .component('bhDepotDropdown', {
    bindings : {
      model : '=',
    },
    templateUrl  : 'partials/templates/bhDepotDropdown.tmpl.html',
    controller   : bhDepotController,
    controllerAs : '$ctrl',
  });

bhDepotController.$inject = ['DepotService', 'appcache', 'NotifyService'];

function bhDepotController(Depot, AppCache, Notify) {
  var $ctrl = this;

  var cache = new AppCache('bhDepotComponent');

  $ctrl.$onInit = function $onInit() {
    Depot.read()
    .then(function (rows) {
      if (!rows.length) { return; }
      $ctrl.depots = rows;
      $ctrl.selection = cache.selection || $ctrl.depots[0];
      $ctrl.model = $ctrl.selection;
      $ctrl.$loading = false;
    })
    .catch(Notify.handleError);
  };

  $ctrl.select = function select(option) {
    $ctrl.selection = option;
    cache.selection = $ctrl.selection;
    $ctrl.model = $ctrl.selection;
  };
}

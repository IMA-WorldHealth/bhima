angular.module('bhima.components')
  .component('bhDepotSelect', {
    bindings : {
      onSelect : '&',
    },
    templateUrl  : 'modules/templates/bhDepotSelect.tmpl.html',
    controller   : bhDepotSelectController,
    controllerAs : '$ctrl',
  });

bhDepotSelectController.$inject = ['DepotService', 'NotifyService'];

function bhDepotSelectController(Depot, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function $onInit() {
    Depot.read()
    .then(function (rows) {
      if (!rows.length) { return; }
      $ctrl.depots = rows;
      $ctrl.onSelect({ depot : $ctrl.selection });
    })
    .catch(Notify.handleError);
  };

  $ctrl.select = function select(option) {
    $ctrl.selection = option;
    $ctrl.onSelect({ depot : $ctrl.selection });
  };
}

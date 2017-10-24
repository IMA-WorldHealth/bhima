angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'modules/templates/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotUuid        : '<',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',
    },
  });

DepotSelectController.$inject = ['DepotService', 'NotifyService', 'SessionService'];

/**
 * Depot selection component
 */
function DepotSelectController(Depots, Notify, Session) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.loading = true;

    // download only the depots that the user has the management right
    var userId = Session.user.id;    

    Depots.read(null, {user_id : userId})
      .then(function (depots) {
        $ctrl.depots = depots;
      })
      .catch(Notify.handleError)
      .finally(function () {
        $ctrl.loading = false;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ depot : $item });
  };
}

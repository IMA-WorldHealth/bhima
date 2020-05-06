angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'js/components/bhDepotSelect/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotUuid        : '<',
      onSelectCallback : '&',
      label            : '@?',
      required         : '<?',
      exception        : '<?', // uuid string or an array of uuids
    },
  });

DepotSelectController.$inject = ['DepotService', 'NotifyService'];

/**
 * Depot selection component
 */
function DepotSelectController(Depots, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    $ctrl.label = $ctrl.label || 'FORM.LABELS.DEPOT';

    if ($ctrl.depotUuid) {
      Depots.read($ctrl.depotUuid)
        .then(depot => {
          $ctrl.depotText = depot.text;
        })
        .catch(Notify.handleError);
    }
  };

  $ctrl.$onChanges = changes => {
    if (changes.depotUuid && changes.depotUuid.currentValue === undefined) {
      $ctrl.depotText = undefined;
    }
  };

  $ctrl.searchByName = text => {
    const options = {
      text : (text || '').toLowerCase(),
      exception : $ctrl.exception,
    };

    return Depots.searchByName(options);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = depot => {
    $ctrl.depotText = depot.text;
    $ctrl.onSelectCallback({ depot });
  };
}

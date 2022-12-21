angular.module('bhima.components')
  .component('bhDepotSelect', {
    templateUrl : 'js/components/bhDepotSelect/bhDepotSelect.tmpl.html',
    controller  : DepotSelectController,
    transclude  : true,
    bindings    : {
      depotUuid        : '<',
      filterByUserPermission  : '@?',
      filterAuthorizedDepotForDistribution : '@?',
      onSelectCallback : '&',
      label            : '@?',
      required         : '<?',
      disabled         : '<?',
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
    $ctrl.label = $ctrl.label
      || $ctrl.required ? 'FORM.LABELS.DEPOT' : 'FORM.LABELS.DEPOT_OPTIONAL';
    if ($ctrl.depotUuid) {
      if ($ctrl.depotUuid === '0') { return; }
      loadDepotByUuid($ctrl.depotUuid);
    }
  };

  function loadDepotByUuid(uuid) {
    Depots.read(uuid)
      .then(depot => {
        $ctrl.depotText = depot.text;
      })
      .catch(Notify.handleError);
  }

  $ctrl.$onChanges = changes => {
    if (changes.depotUuid && changes.depotUuid.currentValue === undefined) {
      $ctrl.depotText = undefined;
    } else if (changes.depotUuid && changes.depotUuid.currentValue) {
      loadDepotByUuid(changes.depotUuid.currentValue);
    }
  };

  $ctrl.searchByName = text => {
    if (!text) {
      return null;
    }

    $ctrl.$loading = true;

    const options = {
      text : (text || '').toLowerCase(),
      exception : $ctrl.exception, // TODO(@jniles) - ensure that this is a UUID, not an object
    };

    if ($ctrl.filterByUserPermission) {
      options.only_user = true;
    }

    if ($ctrl.filterAuthorizedDepotForDistribution) {
      options.only_distributor = true;
    }

    return Depots.searchByName(options);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = depot => {
    $ctrl.depotText = depot.text;
    $ctrl.onSelectCallback({ depot });
  };
}

angular.module('bhima.components')
  .component('bhBedSelect', {
    templateUrl : 'js/components/bhBedSelect/bhBedSelect.html',
    controller  : BedSelectController,
    transclude  : true,
    bindings    : {
      uuid      : '<',
      onSelectCallback : '&',
      required : '<?',
      label    : '@?',
      autoSelect : '<?',
      roomUuid : '<?',
      occupied : '<?',
    },
  });

BedSelectController.$inject = ['BedService', 'NotifyService'];

/**
 * Bed selection component
 */
function BedSelectController(Bed, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'BED.TITLE';
    $ctrl.disabled = !$ctrl.roomUuid;

    // load all beds
    Bed.read(null, loadParams())
      .then(beds => {
        $ctrl.beds = beds;

        if ($ctrl.autoSelect && beds.length > 0) {
          $ctrl.id = beds[0].id;
          $ctrl.onSelectCallback({ bed : $ctrl.id });
        }

        $ctrl.noBedAvailable = !!(beds.length === 0);
      })
      .catch(Notify.handleError);
  };

  $ctrl.$onChanges = (changes) => {
    if ((changes.roomUuid && changes.roomUuid.currentValue) || changes.autoSelect) {
      $ctrl.disabled = !changes.roomUuid.currentValue;

      const params = loadParams();
      params.room_uuid = changes.roomUuid.currentValue;

      Bed.read(null, params)
        .then(beds => {
          $ctrl.beds = beds;

          if ($ctrl.autoSelect && beds.length > 0) {
            $ctrl.id = beds[0].id;
            $ctrl.onSelectCallback({ bed : $ctrl.id });
          }

          $ctrl.noBedAvailable = !!(beds.length === 0);
        })
        .catch(Notify.handleError);
    }
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ bed : $item });
  };

  function loadParams() {
    // load only beds for a given room
    const allBeds = { room_uuid : $ctrl.roomUuid || 'x' };
    const occupiedBeds = { room_uuid : $ctrl.roomUuid || 'x', is_occupied : 1 };
    const notOccupiedBeds = { room_uuid : $ctrl.roomUuid || 'x', is_occupied : 0 };

    // eslint-disable-next-line no-nested-ternary
    return $ctrl.occupied === 'true' ? occupiedBeds
      : $ctrl.occupied === 'false' ? notOccupiedBeds
        : allBeds;
  }
}

angular.module('bhima.components')
  .component('bhRoomSelect', {
    templateUrl : 'js/components/bhRoomSelect/bhRoomSelect.html',
    controller  : RoomSelectController,
    transclude  : true,
    bindings    : {
      uuid      : '<',
      onSelectCallback : '&',
      required : '<?',
      label    : '@?',
      wardUuid : '<?',
    },
  });

RoomSelectController.$inject = ['RoomService', 'NotifyService'];

/**
 * Room selection component
 */
function RoomSelectController(Room, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'ROOM.TITLE';

    // load all depots
    Room.read(null, { ward_uuid : $ctrl.wardUuid })
      .then(rooms => {
        $ctrl.rooms = rooms;
      })
      .catch(Notify.handleError);
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.wardUuid) {
      Room.read(null, { ward_uuid : $ctrl.wardUuid })
        .then(rooms => {
          $ctrl.rooms = rooms;
        })
        .catch(Notify.handleError);
    }
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = $item => {
    $ctrl.onSelectCallback({ room : $item });
  };
}

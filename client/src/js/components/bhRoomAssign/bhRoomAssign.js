angular.module('bhima.components')
  .component('bhRoomAssign', {
    templateUrl : 'js/components/bhRoomAssign/bhRoomAssign.html',
    controller  : RoomAssignController,
    transclude  : true,
    bindings    : {
      onSelectCallback : '&',
      required : '<?',
      label    : '@?',
    },
  });

RoomAssignController.$inject = [];

/**
 * RoomAssign selection component
 */
function RoomAssignController() {
  const $ctrl = this;
  $ctrl.bed = {};

  $ctrl.$onInit = function onInit() {
  };

  $ctrl.$onChanges = () => {
  };

  $ctrl.onSelectAuto = () => {
    $ctrl.bed.isManualAssign = 1;
    $ctrl.onSelectCallback({ bed : $ctrl.bed });
  };

  $ctrl.onSelectWard = ward => {
    $ctrl.ward_uuid = ward.uuid;
  };

  $ctrl.onSelectRoom = room => {
    $ctrl.bed.room_uuid = room.uuid;
    $ctrl.onSelectCallback({ bed : $ctrl.bed });
  };

  $ctrl.onSelectBed = bed => {
    $ctrl.bed.id = bed.id;
    $ctrl.onSelectCallback({ bed : $ctrl.bed });
  };
}

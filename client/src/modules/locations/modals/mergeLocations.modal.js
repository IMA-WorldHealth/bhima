angular.module('bhima.controllers')
  .controller('MergeLocationsModalController', MergeLocationsModalController);

MergeLocationsModalController.$inject = [
  'LocationService', 'data', 'NotifyService', '$uibModalInstance',
];

function MergeLocationsModalController(Locations, data, Notify, Instance) {
  const vm = this;

  vm.locations = data;
  vm.submit = submit;
  vm.cancelUiSref = cancelUiSref;

  // Checks if the locations to be mixed are of the same types
  vm.checkSameType = vm.locations[0].location_type_id === vm.locations[1].location_type_id;

  vm.selectLocation = selected => {
    vm.selected = {
      id : selected.id,
      uuid : selected.location_uuid,
      locationTypeId : selected.location_type_id,
    };

    vm.locations.forEach(location => {
      if (location.location_uuid !== vm.selected.uuid) {
        vm.otherLocation = {
          id : location.id,
          uuid : location.location_uuid,
          locationTypeId : location.location_type_id,
        };
      }
    });
  };

  function cancelUiSref() {
    return Instance.close(true);
  }

  function submit() {
    if (!vm.selected) {
      return Notify.danger('FORM.WARNINGS.EMPTY_SELECTION');
    }

    const params = {
      selected : vm.selected,
      other : vm.otherLocation,
    };

    return Locations.merge(params)
      .then(() => {
        Notify.success('LOCATION.MERGE_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}

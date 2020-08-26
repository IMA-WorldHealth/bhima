angular.module('bhima.controllers')
  .controller('MergeLocationsModalController', MergeLocationsModalController);

MergeLocationsModalController.$inject = [
  'LocationService', 'data', 'NotifyService', '$uibModalInstance',
];

function MergeLocationsModalController(Locations, data, Notify, Instance) {
  const vm = this;
  let otherLocation;

  vm.locations = data;
  vm.submit = submit;
  vm.cancelUiSref = cancelUiSref;

  vm.selectLocation = selected => {
    vm.selected = {
      id : selected.id,
      uuid : selected.location_uuid,
    };

    vm.locations.forEach(location => {
      if (location.location_uuid !== vm.selected.uuid) {
        otherLocation = {
          id : location.id,
          uuid : location.location_uuid,
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
      other : otherLocation,
    };

    return Locations.merge(params)
      .then(() => {
        Notify.success('LOCATION.MERGE_SUCCESS');
        return Instance.close(true);
      })
      .catch(Notify.handleError);
  }
}

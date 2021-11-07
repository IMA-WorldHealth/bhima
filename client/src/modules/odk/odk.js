angular.module('bhima.controllers')
  .controller('OdkController', OdkController);

OdkController.$inject = [
  'OdkService', 'NotifyService',
];

function OdkController(Odk, Notify) {
  const vm = this;

  // bind methods
  vm.loadNutritionReceptions = loadNutritionReceptions;

  function loadNutritionReceptions() {
    return Odk.loadNutritionReceptions()
      .then(result => {
        vm.totalFound = result.length || 0;

        if (vm.totalFound > 0) {
          Notify.success('ODK.IMPORTED_SUCCESSFULLY');
        } else {
          Notify.info('ODK.NO_RECORD_FOUND');
        }
      })
      .catch(Notify.handleError);
  }
}

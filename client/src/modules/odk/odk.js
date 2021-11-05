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
        console.log(result);
        let total = 0;
        if (result.length) {
          total = result.reduce((current, item) => {
            return current + item.boite_barcode_repeat.length;
          }, 0);
        }

        if (total > 0) {
          Notify.success('ODK.IMPORTED_SUCCESSFULLY');
        } else {
          Notify.info('ODK.NO_RECORD_FOUND');
        }

        vm.totalFound = total;
      })
      .catch(Notify.handleError);
  }
}

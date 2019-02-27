angular.module('bhima.components')
  .component('bhDischargeSelect', {
    bindings : {
      onChangeCallback : '&',
    },
    templateUrl : 'js/components/bhDischargeSelect/bhDischargeSelect.html',
    controller : DischargeSelectController,
  });

DischargeSelectController.$inject = ['DischargeTypeService'];

function DischargeSelectController(DischargeTypes) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    DischargeTypes.read()
      .then(data => {
        if (data.length) {
          $ctrl.value = data[0].id;
        }
        $ctrl.dischargeTypeList = data;
      });
  };

  $ctrl.onChange = (value) => {
    $ctrl.onChangeCallback({ dischargeType : value });
  };
}

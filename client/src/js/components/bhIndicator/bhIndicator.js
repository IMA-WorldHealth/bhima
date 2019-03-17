angular.module('bhima.components')
  .component('bhIndicator', {
    templateUrl : 'js/components/bhIndicator/bhIndicator.html',
    controller  : IndicatorController,
    transclude  : true,
    bindings    : {
      key : '@',
      label : '@',
      value : '<',
      valueSymbol : '@?',
      description : '@?',
      calcul : '@?',
      norm : '@?',
      minValue : '@?',
      maxValue : '@?',
      dependencies : '<?', // an array of object [{ key:..., value:...}]
    },
  });

IndicatorController.$inject = [
  '$uibModal',
];

function IndicatorController($uibModal) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    if ($ctrl.value && $ctrl.minValue && !$ctrl.maxValue) {
      $ctrl.isAcceptable = $ctrl.value >= $ctrl.minValue;
    }

    if ($ctrl.value && !$ctrl.minValue && $ctrl.maxValue) {
      $ctrl.isAcceptable = $ctrl.value <= $ctrl.maxValue;
    }

    if ($ctrl.value && $ctrl.minValue && $ctrl.maxValue) {
      $ctrl.isAcceptable = $ctrl.value >= $ctrl.minValue && $ctrl.value <= $ctrl.maxValue;
    }

    if (!$ctrl.minValue && !$ctrl.maxValue) {
      $ctrl.isAcceptable = true;
    }
  };

  $ctrl.showDetails = () => {
    const params = {
      key : $ctrl.key,
      dependencies : $ctrl.dependencies,
      label : $ctrl.label,
      value : $ctrl.value,
      valueSymbol : $ctrl.valueSymbol,
      description : $ctrl.description,
      calcul : $ctrl.calcul,
      norm : $ctrl.norm,
      minValue : $ctrl.minValue,
      maxValue : $ctrl.maxValue,
      isAcceptable : $ctrl.isAcceptable,
    };

    $uibModal.open({
      keyboard : false,
      backdrop : true,
      size : 'lg',
      templateUrl : 'modules/dashboards/modals/details.modal.html',
      controller : 'IndicatorDetailsModalController as $ctrl',
      resolve : {
        data : function paramsProvider() { return params; },
      },
    });
  };
}

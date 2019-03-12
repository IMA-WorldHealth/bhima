angular.module('bhima.components')
  .component('bhIndicator', {
    templateUrl : 'js/components/bhIndicator/bhIndicator.html',
    controller  : IndicatorController,
    transclude  : true,
    bindings    : {
      key : '@',
      label : '@',
      value : '@',
      valueSymbol : '@?',
      description : '@?',
      calcul : '@?',
      norm : '@?',
      minValue : '@?',
      maxValue : '@?',
    },
  });

IndicatorController.$inject = [];

function IndicatorController() {
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
}

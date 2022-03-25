angular.module('bhima.components')
  .component('bhAssetConditionSelect', {
    templateUrl : 'js/components/bhAssetConditionSelect/bhAssetConditionSelect.tmpl.html',
    controller  : AssetConditionSelectController,
    transclude  : true,
    bindings    : {
      conditionId      : '<',
      label            : '@?',
      onSelectCallback : '&',
      required         : '<?',
    },
  });

AssetConditionSelectController.$inject = ['NotifyService', 'AssetsConditionService'];

/**
 * Select asset condition controller
 */
function AssetConditionSelectController(Notify, AssetConditions) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'ASSET.ASSET_CONDITION';

    AssetConditions.list()
      .then(conditions => {
        $ctrl.conditions = conditions;
      })
      .catch(Notify.handleError);
  };

  $ctrl.onSelect = cond => {
    $ctrl.onSelectCallback({ cond });
  };
}

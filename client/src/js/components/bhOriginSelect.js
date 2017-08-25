angular.module('bhima.components')
  .component('bhOriginSelect', {
    templateUrl : 'modules/templates/bhOriginSelect.tmpl.html',
    controller  : OriginSelectController,
    transclude  : true,
    bindings    : {
      originUuid     : '<',
      onSelectCallback : '&',
      required         : '<?',
      validateTrigger  : '<?',
    },
  });

OriginSelectController.$inject = [
  'StockModalService', 'NotifyService'
];

/**
 * Origin selection component
 */
function OriginSelectController(Stock, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when a Origin has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // load all Origin Order
    Stock.stockOrigin()
      .then(function (origins) {
        $ctrl.origins = origins;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ origin : $item });
  };
}

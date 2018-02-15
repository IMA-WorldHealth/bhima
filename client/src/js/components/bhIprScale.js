angular.module('bhima.components')
  .component('bhIprScale', {
    templateUrl : 'modules/templates/bhIprScale.tmpl.html',
    controller  : IprScaleController,
    bindings    : {
      onUpdate : '&',
    },
  });

IprScaleController.$inject = ['IprTaxService', 'AppCache', 'Store', 'NotifyService'];

/**
 * Ipr Scale Component
 */
function IprScaleController(IprTaxes, AppCache, Store, Notify) {
  var ctrl = this;
  var cache = new AppCache('iprScale');

  this.$onInit = function $onInit() {
    IprTaxes.read()
      .then(function (iprTaxes) {
        ctrl.iprTaxes = new Store();
        ctrl.iprTaxes.setData(iprTaxes);
        loadDefaultScale();
      })
      .catch(Notify.handleError);
  };

  ctrl.update = function update(scale) {
    if(scale){
      ctrl.selectedScale = scale;

      // update cache with id to select this scale object on next load
      cache.selectedScaleId = scale.id;

      // update bindings
      ctrl.onUpdate({ scaleId : scale.id });
    }  
  };

  function loadDefaultScale() {
    // if the cache exists - use that
    var cached = cache.selectedScaleId;
    if (cached) {
      ctrl.update(ctrl.iprTaxes.get(cached));
    }
  }
}

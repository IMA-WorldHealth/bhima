angular.module('bhima.services')
.service('GridStateService', GridStateService);

GridStateService.$inject = [
  'util', 'appcache', 'NotifyService'
];

// responsible for -
// - caching grid state seperately for each grid
// - hooking into the grid api to apply the default size only when the grid is ready
// - exposing the methods to save and restore grid state
function GridStateService(util, AppCache, Notify) {
  /* @const */
  var stateCacheKey = 'gridState';

  function StateInstance(gridOptions, moduleCacheKey) {
    this._cacheKey = moduleCacheKey.concat(stateCacheKey);
    this._cache = new AppCache(this._cacheKey);

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this._gridApi = api;

      this._gridApi.core.on.rowsRendered(null, util.once(function () {
        this.restoreGridState();
      }.bind(this)));
    }.bind(this));

    this.saveGridState = saveGridState.bind(this);
    this.restoreGridState = restoreGridState.bind(this);
  }

  function saveGridState() {
    if (this._gridApi) {
      this._cache.gridState = this._gridApi.saveState.save();
      Notify.success('FORM.INFO.GRID_STATE_SUCCESS');
    }
  };

  function restoreGridState() {
    if (this._gridApi && this._cache.gridState) {
      this._gridApi.saveState.restore(null, this._cache.gridState);
    }
  };
  return StateInstance;
}

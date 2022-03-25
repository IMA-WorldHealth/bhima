angular.module('bhima.services')
  .service('AssetsConditionService', AssetsConditionService);

AssetsConditionService.$inject = [
  '$http', 'util', '$translate',
];

/**
 * This service encapsulate some common method of stock lots registry with the aims
 * of reducing lines in registry.js
 */
function AssetsConditionService($http, util, $translate) {
  const service = this;

  /**
   * @function list()
   * @returns list of asset conditions (translated)
   */
  service.list = () => {
    return $http.get('/asset/conditions')
      .then(util.unwrapHttpResponse)
      .then(conds => {
        conds.forEach(cond => {
          if (cond.predefined) {
            cond.condition = $translate.instant(cond.condition);
          }
        });
        return conds;
      });
  };

}

angular.module('bhima.services')
  .service('AssetsScanService', AssetsScanService);

AssetsScanService.$inject = [
  '$http', 'util', '$translate',
];

/**
 * This service encapsulate some common method of stock lots registry with the aims
 * of reducing lines in registry.js
 */
function AssetsScanService($http, util, $translate) {
  const service = this;

  /**
   * @function list()
   * @returns list of asset scans
   */
  service.list = (params) => {
    return $http.get('/asset/scans', { params })
      .then(util.unwrapHttpResponse)
      .then(conds => {
        conds.forEach(cond => {
          cond.condition_label = cond.condition_predefined
            ? $translate.instant(cond.condition) : cond.condition;
        });
        return conds;
      });
  };

  /**
   * @description Get the details of a specific asset scan
   * @param {string} uuid
   * @returns {object} scan details
   */
  service.details = uuid => {
    return $http.get(`/asset/scan/${uuid}`)
      .then(util.unwrapHttpResponse)
      .then(details => {
        details.condition_label = details.condition_predefined
          ? $translate.instant(details.condition) : details.condition;
        return details;
      });
  };

  /**
   * @description Create a new scan
   * @param {object} params
   * @returns {string} UUID of newly created asset scan
   */
  service.create = params => {
    return $http.post(`/asset/scan`, params)
      .then(util.unwrapHttpResponse);
  };

  /**
   * @description Update a specific asset scan
   * @param {string} uuid of asset scan to change
   * @param {object} params items to change
   * @returns
   */
  service.update = (uuid, params) => {
    return $http.put(`/asset/scan/${uuid}`, params)
      .then(util.unwrapHttpResponse);
  };

  /**
   * @description Delete a specific asset scan
   * @param {string} uuid
   * @returns
   */
  service.delete = uuid => {
    return $http.delete(`/asset/scan/${uuid}`)
      .then(util.unwrapHttpResponse);
  };

}

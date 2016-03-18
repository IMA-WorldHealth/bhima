angular.module('bhima.services')
.service('DonorService', DonorService);

DonorService.$inject = ['$http', 'util'];

/**
* Donor Service
*
* Encapuslates common requests to the /donors/ endpoint.
*/
function DonorService($http, util) {
  var service = this,
      baseUrl = '/donors/';

  service.list = list;
  service.detail = detail;
  service.create = create;
  service.update = update;
  service.remove = remove;

  /**
  * @function list
  * @description get list of donors
  */
  function list() {
    return $http.get(baseUrl)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function detail
  * @description get detail of a specific donor
  */
  function detail(id) {
    return $http.get(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function create
  * @param {object} donor The donor object
  * @description Create a new donor
  */
  function create(donor) {
    return $http.post(baseUrl, donor)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function update
  * @param {string} uuid The donor uuid
  * @param {object} donor The update donor data
  * @description Edit an existing donor
  */
  function update(id, donor) {
    return $http.put(baseUrl + id, donor)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @function remove
  * @description remove a specific donor
  */
  function remove(id) {
    return $http.delete(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

}

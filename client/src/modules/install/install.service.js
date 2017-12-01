angular.module('bhima.services')
  .service('InstallService', InstallService);

InstallService.$inject = ['$http', 'util'];

// service definition
function InstallService($http, util) {
  var service = this;

  var baseUrl = '/install';

  /**
   * @method checkStartInstall
   *
   * @description
   * call the server API for checking
   * if the application is already installed or not
   *
   * @return {boolean}
   */
  service.checkBasicInstallExist = function checkBasicInstallExist() {
    return $http.get(baseUrl).then(util.unwrapHttpResponse);
  };

  /**
   * @method proceedInstall
   *
   * @description
   * proceed to the effective data insertion for the new installation
   */
  service.proceedInstall = function proceedInstall(data) {
    return $http.post(baseUrl, data).then(util.unwrapHttpResponse);
  };
}

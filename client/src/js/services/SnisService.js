angular.module('bhima.services')
.service('SnisService', SnisService);

SnisService.$inject = ['$http', 'util'];

function SnisService($http, util) {
  var service = this;

  service.healthZones = healthZones;

  function healthZones() {
    var url = '/snis/healthZones';
    return $http.get(url)
      .then(util.unwrapHttpResponse)
      .then(function (zones) {

        // human-readable format
        zones.forEach(function (zone) {
          zone.format = zone.zone + ' - ' + zone.territoire + ' (' + zone.province + ')';
        });

        return zones;
      });
  }

  return service;
}

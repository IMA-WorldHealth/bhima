angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

      .state('locations', {
        url         : '/locations',
        controller  : 'LocationController as LocationCtrl',
        templateUrl : 'partials/locations/locations.html',
      })
      .state('locationsVillage', {
        url         : '/locations/village',
        controller  : 'VillageController as VillageCtrl',
        templateUrl : 'partials/locations/village/village.html',
      })
      .state('locationsSector', {
        url         : '/locations/sector',
        controller  : 'SectorController as SectorCtrl',
        templateUrl : 'partials/locations/sector/sector.html',
      })
      .state('locationsProvince', {
        url         : '/locations/province',
        controller  : 'ProvinceController as ProvinceCtrl',
        templateUrl : 'partials/locations/province/province.html',
      })
      .state('locationsCountry', {
        url         : '/locations/country',
        controller  : 'CountryController as CountryCtrl',
        templateUrl : 'partials/locations/country/country.html',
      });
  }]);


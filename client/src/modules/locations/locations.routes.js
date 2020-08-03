angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('locations', {
        url         : '/locations',
        controller  : 'LocationController as LocationCtrl',
        templateUrl : 'modules/locations/locations.html',
      })
      .state('typesLocations', {
        url         : '/locations/types',
        controller  : 'TypesController as TypesCtrl',
        templateUrl : 'modules/locations/types/types.html',
      })
      .state('locationsConfiguration', {
        url         : '/locations/configuration',
        controller  : 'LocationsConfigController as LocationsConfigCtrl',
        templateUrl : 'modules/locations/configurations/configurations.html',
      })
      .state('locationsVillage', {
        url         : '/locations/village',
        controller  : 'VillageController as VillageCtrl',
        templateUrl : 'modules/locations/village/village.html',
      })
      .state('locationsSector', {
        url         : '/locations/sector',
        controller  : 'SectorController as SectorCtrl',
        templateUrl : 'modules/locations/sector/sector.html',
      })
      .state('locationsProvince', {
        url         : '/locations/province',
        controller  : 'ProvinceController as ProvinceCtrl',
        templateUrl : 'modules/locations/province/province.html',
      })
      .state('locationsCountry', {
        url         : '/locations/country',
        controller  : 'CountryController as CountryCtrl',
        templateUrl : 'modules/locations/country/country.html',
      })
      .state('locationsMerge', {
        url         : '/locations/merge',
        params      : {
          locations : [],
        },
        onEnter : ['$uibModal', mergeLocationsModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('locationsConfiguration.create', {
        url : '/create',
        params : {
          configurations : { value : null },
          parentId : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', locationManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('locationsConfiguration.edit', {
        url : '/:id/edit',
        params : {
          configurations : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', locationManagementModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function mergeLocationsModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/locations/modals/mergeLocations.modal.html',
    controller : 'MergeLocationsModalController as MergeLocationsModalCtrl',
  });
}

function locationManagementModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/locations/configurations/modals/config.modals.html',
    controller : 'ConfigLocationsModalController as ConfigLocationsModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}

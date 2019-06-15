angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('indicatorsFilesRegistry', {
        url         : '/dashboards/indicators_files_registry',
        controller  : 'IndicatorsFilesRegistryController as $ctrl',
        templateUrl : 'modules/dashboards/indicators_files_registry/indicators_files_registry.html',
      })

      .state('indicatorsFilesRegistry.addHospitalizationFile', {
        url : '/addHospitalizationFile',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', hospitalizationModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.editHospitalizationFile', {
        url : '/editHospitalizationFile',
        params : {
          creating : { value : false },
          uuid : null,
        },
        onEnter : ['$uibModal', hospitalizationModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.addStaffFile', {
        url : '/addStaffFile',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', staffModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.editStaffFile', {
        url : '/editStaffFile',
        params : {
          creating : { value : false },
          uuid : null,
        },
        onEnter : ['$uibModal', staffModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.addFinanceFile', {
        url : '/addFinanceFile',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', financeModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.editFinanceFile', {
        url : '/editFinanceFile',
        params : {
          creating : { value : false },
          uuid : null,
        },
        onEnter : ['$uibModal', financeModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('hospitalizationDashboard', {
        url         : '/dashboards/hospitalization',
        controller  : 'HospitalizationDashboardController as $ctrl',
        templateUrl : 'modules/dashboards/hospitalization/hospitalization.html',
      })

      .state('staffDashboard', {
        url         : '/dashboards/staff',
        controller  : 'StaffDashboardController as $ctrl',
        templateUrl : 'modules/dashboards/staff/staff.html',
      })

      .state('financeDashboard', {
        url         : '/dashboards/finances',
        controller  : 'FinanceDashboardController as $ctrl',
        templateUrl : 'modules/dashboards/finance/finance.html',
      });
  }]);

function hospitalizationModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    size : 'lg',
    templateUrl : 'modules/dashboards/indicators_files_registry/modals/hospitalization.modal.html',
    controller : 'HospitalizationModalController as $ctrl',
  });
}

function staffModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    size : 'lg',
    templateUrl : 'modules/dashboards/indicators_files_registry/modals/staff.modal.html',
    controller : 'StaffModalController as $ctrl',
  });
}

function financeModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    size : 'lg',
    templateUrl : 'modules/dashboards/indicators_files_registry/modals/finance.modal.html',
    controller : 'FinanceModalController as $ctrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}

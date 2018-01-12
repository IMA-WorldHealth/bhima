angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('holidays', {
      url         : '/holidays',
      controller  : 'HolidayManagementController as HolidayCtrl',
      templateUrl : 'modules/holidays/holidays.html',
    })

    .state('holidays.create', {
      url : '/create',
      params : {
        holiday : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', holidayModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('holidays.edit', {
      url : '/:id/edit',
      params : {
        holiday : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', holidayModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function holidayModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/holidays/modals/holiday.modal.html',
    controller : 'HolidayModalController as HolidayModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
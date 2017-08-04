angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('emailreport', {
        url: '/email-report/',
        controller: 'EmailReportController as EmailReportCtrl',
        templateUrl: 'modules/email-report/index.html',
        params: {
          data: null,
        },
      })
      .state('emailreport.selectProfile', {
        url: '/selectProfile',
        onEnter: ['$state', '$uibModal', 'NotifyService', onSelectProfileFactory('selectProfile')],
        onExit: ['$uibModalStack', closeModal],
      })
      .state('emailreport.groupProileList', {
        url: '/groupProileList/:index_current_category',
        onEnter: ['$state', '$uibModal', 'NotifyService', onSelectProfileCategoryFactory('category')],
        onExit: ['$uibModalStack', closeModal],
      });

  }]);


/**
 * @function onEnterFactory
 *
 * @description
 * This configures the update versus create states.
 */
function onSelectProfileFactory(stateType) {
  var isCreateState = (stateType === 'selectProfile');

  var ctrl = 'CategoriesPeopleModalController as catPeopleModalListCtrl';

  return function onEnter($state, Modal, Notify) {
    Modal.open({
      templateUrl: 'modules/email-report/modal/liste-categories-people-modal.html',
      controller: ctrl,
      backdrop: 'static',
      keyboard: false,
    }).result
      .then(function (id) {
        Notify.success(message);
      })
      .catch(function (error) {
        if (error) {
          Notify.handleError(error);
        }
      });
  };
}


function onSelectProfileCategoryFactory(stateType) {
  var isCreateState = (stateType === 'category');

  var ctrl = 'CategoriesPeopleListController as catPeopleListCtrl';

  return function onEnter($state, Modal, Notify) {
    Modal.open({
      templateUrl: 'modules/email-report/modal/categories-people-list-modal.html',
      controller: ctrl,
      backdrop: 'static',
      keyboard: true,
    }).result
      .then(function (id) {
        Notify.success(message);
      })
      .catch(function (error) {
        if (error) {
          Notify.handleError(error);
        }
      });
  };
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}


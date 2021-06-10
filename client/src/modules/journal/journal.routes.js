angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('journal', {
        url         : '/journal',
        controller  : 'JournalController as JournalCtrl',
        templateUrl : 'modules/journal/journal.html',
        params : {
          filters : [],
          scrollTo : null,
        },
      })
      .state('journal_log', {
        url         : '/journal/log',
        controller  : 'JournalLogController as JournalLogCtrl',
        templateUrl : 'modules/journal/journal_log.html',
        params : {
          filters : [],
        },
      })
      .state('TrialBalanceModal', {
        parent  : 'journal',
        onEnter : ['$state', '$uibModal', ($state, Modal) => {
          Modal.open({
            size        : 'lg',
            controller  : 'TrialBalanceController as TrialBalanceCtrl',
            templateUrl : 'modules/journal/trial-balance/structure.html',
            keyboard    : false,
            backdrop    : 'static',
          });
        }],
        onExit : ['$uibModalStack', (ModalStack) => {
          ModalStack.dismissAll();
        }],
      })
      .state('TrialBalanceOverview', {
        parent : 'TrialBalanceModal',
        views : {
          'modal-body@' : {
            controller : 'TrialBalanceOverviewController as OverviewCtrl',
            templateUrl : 'modules/journal/trial-balance/overview.html',
          },
        },
      })
      .state('TrialBalanceErrors', {
        parent : 'TrialBalanceModal',
        views : {
          'modal-body@' : {
            controller : 'TrialBalanceErrorsController as ErrorsCtrl',
            templateUrl : 'modules/journal/trial-balance/errors.html',
          },
        },
      });
  }]);

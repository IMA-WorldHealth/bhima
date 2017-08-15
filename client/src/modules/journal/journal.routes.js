angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

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
      .state('postedJournal', {
        url         : '/journal/posted',
        controller  : 'GeneralLedgerController as GeneralLedgerCtrl',
        templateUrl : 'modules/general-ledger/general-ledger.html',
      })
      .state('TrialBalanceModal', {
        parent  : 'journal',
        onEnter : ['$state', '$uibModal', function ($state, Modal) {
          Modal.open({
            size        : 'lg',
            templateUrl : 'modules/journal/modals/trialBalanceStructure.html',
            keyboard    : false,
            backdrop    : 'static',
          });
        }],
        onExit : ['$uibModalStack', function (ModalStack) {
          ModalStack.dismissAll();
        }],
      })
      .state('TrialBalance', {
        parent : 'TrialBalanceModal',
        views : {
          'modal-body@' : {
            controller : 'TrialBalanceController as TrialBalanceCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceMain.body.html',
          },
        },
      })
      .state('TrialBalanceDetail', {
        parent : 'TrialBalanceModal',
        views : {
          'modal-body@' : {
            controller : 'TrialBalanceDetailBodyController as TrialBalanceDetailBodyCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceDetail.body.html',
          },
        },
      })
      .state('TrialBalanceErrors', {
        parent : 'TrialBalanceModal',
        views : {
          'modal-body@' : {
            controller : 'TrialBalanceErrorBodyController as TrialBalanceErrorBodyCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceError.body.html',
          },
        },
      });
  }]);

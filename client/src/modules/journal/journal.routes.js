angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('journal', {
        url         : '/journal',
        controller  : 'JournalController as JournalCtrl',
        templateUrl : 'modules/journal/journal.html'
      })
      .state('postedJournal', {
        url         : '/journal/posted',
        controller  : 'GeneralLedgerController as GeneralLedgerCtrl',
        templateUrl : 'modules/general-ledger/general-ledger.html',
      })
      .state('journalPrint', {
        controller  : 'journal.print',
        templateUrl : 'modules/journal/print.html'
      })
      .state('journalVoucher', {
        controller  : 'JournalVoucherController as JournalVoucherCtrl',
        templateUrl : 'modules/journal/voucher/voucher.html'
      })
      .state('journalModal', {
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
      .state('trialBalanceMain',{
        parent : 'journalModal',
        params : {
          records : null
        },
        data : {
          checkingData : null,
          checked : null
        },
        views : {
          'modal-header@' : {
            templateUrl : 'modules/journal/modals/trialBalanceMain.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceMainBodyController as TrialBalanceMainBodyCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceMain.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceMainFooterController as TrialBalanceMainFooterCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceMain.footer.html'
          }
        }
      })
      .state('trialBalanceDetail',{
        parent : 'journalModal',
        params : {
          lines : null,
          feedBack : null,
          records : null, //original selected data from the journal
          errors : null
        },
        views : {
          'modal-header@' : {
            templateUrl : 'modules/journal/modals/trialBalanceDetail.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceDetailBodyController as TrialBalanceDetailBodyCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceDetail.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceDetailFooterController as TrialBalanceFooterDetailCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceDetail.footer.html'
          }
        }
      })
      .state('trialBalanceErrors',{
        parent : 'journalModal',
        params : {
          lines : null,
          feedBack : null,
          records : null
        },
        views : {
          'modal-header@' : {
            templateUrl : 'modules/journal/modals/trialBalanceError.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceErrorBodyController as TrialBalanceErrorBodyCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceError.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceErrorFooterController as TrialBalanceErrorFooterCtrl',
            templateUrl : 'modules/journal/modals/trialBalanceError.footer.html'
          }
        }
      });
  }]);

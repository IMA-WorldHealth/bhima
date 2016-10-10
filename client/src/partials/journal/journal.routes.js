
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('journal', {
        url : '/journal',
        controller : 'JournalController as JournalCtrl',
        templateUrl : 'partials/journal/journal.html'
      })
      .state('journalPrint', {
        controller : 'journal.print',
        templateUrl : 'partials/journal/print.html'
      })
      .state('journalVoucher', {
        controller: 'JournalVoucherController as JournalVoucherCtrl',
        templateUrl: 'partials/journal/voucher/voucher.html'
      })
      .state('journalModal', {
        parent : 'journal',
        onEnter : ['$state', '$uibModal', function ($state, Modal) {
          Modal.open({
            size : 'lg',
            templateUrl : 'partials/journal/modals/trialBalanceStructure.html'
          }).result.then(function () {
              // go to the parent state (with refresh)
              $state.go('journal', null, { reload : true });
            })
            .catch(function () {
              $state.go('journal', null, { notify: false });
            });
        }],
        onExit : ['$uibModalStack', function (ModalStack) {
          ModalStack.dismissAll();
        }]
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
            templateUrl : 'partials/journal/modals/trialBalanceMain.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceMainBodyController as TrialBalanceMainBodyCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceMain.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceMainFooterController as TrialBalanceMainFooterCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceMain.footer.html'
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
            templateUrl : 'partials/journal/modals/trialBalanceDetail.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceDetailBodyController as TrialBalanceDetailBodyCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceDetail.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceDetailFooterController as TrialBalanceFooterDetailCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceDetail.footer.html'
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
            templateUrl : 'partials/journal/modals/trialBalanceError.header.html'
          },
          'modal-body@' : {
            controller : 'TrialBalanceErrorBodyController as TrialBalanceErrorBodyCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceError.body.html'
          },
          'modal-footer@' : {
            controller : 'TrialBalanceErrorFooterController as TrialBalanceErrorFooterCtrl',
            templateUrl : 'partials/journal/modals/trialBalanceError.footer.html'
          }
        }
      });
  }]);
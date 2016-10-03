angular.module('bhima.services')
  .service('JournalPostingService', JournalPostingService);

JournalPostingService.$inject = [ '$uibModal' ];

function JournalPostingService(Modal) {

  this.openTrialBalanceModal = openTrialBalanceModal;

  function openTrialBalanceModal(records) {

    return Modal.open({
      templateUrl: 'partials/journal/modals/journalPosting.modal.html',
      controller:  'JournalPosterModalController as JournalPosterModalCtrl',
      size : 'lg',
      resolve : {
        Records : function recordsProvider() { return records; }
      }
    });
  }

  return this;
}
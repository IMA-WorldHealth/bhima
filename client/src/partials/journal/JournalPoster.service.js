angular.module('bhima.services')
  .service('JournalPosterService', JournalPosterService);

JournalPosterService.$inject = [ '$uibModal' ];

function JournalPosterService(Modal) {

  var service = this;

  service.openTrialBalanceModal = openTrialBalanceModal;

  /**
   * @method openTrialBalanceModal
   *
   * @description
   * open a dialog to let the user do trial balance.
   */

  function openTrialBalanceModal (transactions) {
    return Modal.open({
      templateUrl: 'partials/journal/modals/journalPoster.modal.html',
      controller:  'JournalPosterModalController as JournalPosterModalCtrl',
      size : 'lg',
      resolve : {
        Columns : function columnsProvider() { return transactions; }
      }
    });
  }

  return service;
}


angular.module('bhima.services')
  .service('JournalConfigService', JournalConfigService);

JournalConfigService.$inject = [ '$uibModal' ];

function JournalConfigService(Modal) {

  var service = this;

  service.openSearchModal = openSearchModal;

  function openSearchModal(options) {
    return Modal.open({
      templateUrl: 'modules/journal/modals/search.modal.html',
      controller:  'JournalSearchModalController as ModalCtrl',
      resolve : {
        options : function () { return options; }
      }
    }).result;
  }

  return service;
}


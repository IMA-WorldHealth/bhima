angular.module('bhima.services')
  .service('JournalConfigService', JournalConfigService);

JournalConfigService.$inject = [ '$uibModal' ];

function JournalConfigService(Modal) {

  var service = this;

  service.openSearchModal = openSearchModal;

  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/journal/modals/search.modal.html',
      controller :  'JournalSearchModalController as ModalCtrl',
      resolve : {
        filters : function () { return filters; },
      },
    }).result;
  }

  return service;
}


angular.module('bhima.services')
  .service('JournalConfigService', JournalConfigService);

JournalConfigService.$inject = [ '$uibModal' ];

function JournalConfigService(Modal) {

  var service = this;

  service.openColumnConfigModal = openColumnConfigModal;
  service.openSearchModal = openSearchModal;

  function openColumnConfigModal(Columns) {
    return Modal.open({
      templateUrl: 'partials/journal/modals/columnsConfig.modal.html',
      controller:  'ColumnsConfigModalController as ColumnsConfigModalCtrl',
      size : 'lg',
      resolve : {
        Columns : function columnsProvider() { return Columns; }
      }
    });
  }

  function openSearchModal(options) {
    return Modal.open({
      templateUrl: 'partials/journal/modals/search.modal.html',
      controller:  'JournalSearchModalController as ModalCtrl',
      resolve : {
        options : function () { return options; }
      }
    }).result;
  }

  return service;
}


angular.module('bhima.services')
  .service('JournalConfigService', JournalConfigService);

JournalConfigService.$inject = [ '$uibModal' ];

function JournalConfigService(Modal) {

  var service = this;

  service.openColumnConfigModal = openColumnConfigModal;

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

  return service;
}


angular.module('bhima.services')
  .service('JournalConfigService', JournalConfigService);

JournalConfigService.$inject = ['$uibModal'];

function JournalConfigService(Modal) {
  var service = this;

  service.openSearchModal = openSearchModal;

  /**
   * openSearchModal
   * @param {object} filters
   * @param {object} options - { hasDefaultAccount: true } define other options
   */
  function openSearchModal(filters, options) {
    return Modal.open({
      templateUrl : 'modules/journal/modals/search.modal.html',
      controller :  'JournalSearchModalController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        filters : function () { return filters; },
        options : function () { return options || {}; },
      },
    }).result;
  }

  return service;
}


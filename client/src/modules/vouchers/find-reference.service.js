angular.module('bhima.services')
  .service('FindReferenceService', FindReferenceService);

FindReferenceService.$inject = ['$uibModal', 'PrototypeApiService'];

function FindReferenceService(Modal, Api) {
  const service = new Api('/finance/records');

  service.openModal = openModal;

  /**
   * @function openModal
   * @description open the modal for references (patient invoices, cash payment and vuocher)
   * @param {object} entity the entity parameter is not required, it's for specifying the entity's references
   */
  function openModal(entity) {
    const instance = Modal.open({
      templateUrl  : 'modules/templates/modals/findReference.modal.html',
      controller   : 'FindReferenceModalController',
      controllerAs : '$ctrl',
      size         : 'lg',
      animation    : true,
      resolve      : {
        entity() {
          return entity || {};
        },
      },
    });

    return instance.result;
  }

  return service;
}

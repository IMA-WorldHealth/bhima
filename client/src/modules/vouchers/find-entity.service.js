angular.module('bhima.services')
  .service('FindEntityService', FindEntityService);

FindEntityService.$inject = ['$uibModal'];

function FindEntityService(Modal) {
  const service = this;

  service.openModal = openModal;

  function openModal() {
    const instance = Modal.open({
      templateUrl  : 'modules/templates/modals/findEntity.modal.html',
      controller   : 'FindEntityModalController',
      controllerAs : '$ctrl',
      size         : 'md',
      animation    : true,
    });
    return instance.result;
  }

}

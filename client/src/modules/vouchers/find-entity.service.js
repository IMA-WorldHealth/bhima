angular.module('bhima.services')
.service('FindEntityService', FindEntityService);

FindEntityService.$inject = ['$uibModal'];

function FindEntityService(Modal) {
  var service = this;

  service.openModal = openModal;

  function openModal() {
    var instance = Modal.open({
      templateUrl  : 'modules/templates/modals/findEntity.modal.html',
      controller   : 'FindEntityModalController',
      controllerAs : '$ctrl',
      size         : 'md',
      animation    : true
    });
    return instance.result;
  }

}

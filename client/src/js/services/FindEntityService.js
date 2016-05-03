angular.module('bhima.services')
.service('FindEntityService', FindEntityService);

FindEntityService.$inject = ['$uibModal'];

function FindEntityService(Modal) {
  var service = this;

  service.openModal = openModal;

  function openModal(row) {
    var instance = Modal.open({
      templateUrl  : 'partials/templates/modals/findEntity.modal.html',
      controller   : 'FindEntityModalController',
      controllerAs : '$ctrl',
      size         : 'md',
      animation    : true
    });
    instance.result.then(function (result) {
      row.entity = result;
    });
  }

}

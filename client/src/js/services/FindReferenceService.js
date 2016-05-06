angular.module('bhima.services')
.service('FindReferenceService', FindReferenceService);

FindReferenceService.$inject = ['$uibModal'];

function FindReferenceService(Modal) {
  var service = this;

  service.openModal = openModal;

  function openModal(row) {
    var instance = Modal.open({
      templateUrl  : 'partials/templates/modals/findReference.modal.html',
      controller   : 'FindReferenceModalController',
      controllerAs : '$ctrl',
      size         : 'lg',
      animation    : true,
      resolve      : {
        data : function () {
          return row;
        }
      }
    });
    instance.result.then(function (reference) {
      row.reference = reference;
    });
  }

}

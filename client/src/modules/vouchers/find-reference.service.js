angular.module('bhima.services')
  .service('FindReferenceService', FindReferenceService);

FindReferenceService.$inject = ['$uibModal'];

function FindReferenceService(Modal) {
  var service = this;

  service.openModal = openModal;

  /**
   * @function openModal
   * @description open the modal for references (patient invoices, cash payment and vuocher)
   * @param {object} entity the entity parameter is not required, it's for specifying the entity's references
   */
  function openModal(entity) {
    var instance = Modal.open({
      templateUrl  : 'modules/templates/modals/findReference.modal.html',
      controller   : 'FindReferenceModalController',
      controllerAs : '$ctrl',
      size         : 'lg',
      animation    : true,
      resolve      : {
        entity : function () {
          return entity || {};
        }
      }
    });
    return instance.result;
  }

}

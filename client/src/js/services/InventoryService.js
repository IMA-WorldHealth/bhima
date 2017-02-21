angular.module('bhima.services')
  .service('InventoryService', InventoryService);

InventoryService.$inject = [
  'PrototypeApiService', 'InventoryGroupService', 'InventoryUnitService', 'InventoryTypeService', '$uibModal'
];

function InventoryService(Api, Groups, Units, Types, $uibModal) {
  var service = new Api('/inventory/metadata/');

  // expose inventory services through a nicer API
  service.Groups = Groups;
  service.Units = Units;
  service.Types = Types;
  service.openSearchModal = openSearchModal; 

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl: 'partials/inventory/list/modals/search.modal.html',
      size: 'md',
      keyboard: false,
      animation: false,
      backdrop: 'static',
      controller: 'InventoryServiceModalController as ModalCtrl',
      resolve : {
        params : function paramsProvider() { return params; }
      }
    }).result;
  }

  return service;
}

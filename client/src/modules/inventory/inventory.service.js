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
  service.formatFilterParameters = formatFilterParameters;  

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl: 'modules/inventory/list/modals/search.modal.html',
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

  /**
   * This function prepares the headers inventory properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in it's own service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'group_uuid', displayName: 'FORM.LABELS.GROUP' },
      { field: 'text', displayName: 'FORM.LABELS.LABEL' }
    ];
    // returns columns from filters
    return columns.filter(function (column) {
      var LIMIT_UUID_LENGTH = 6;
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        
        return true;
      } else {
        return false;
      }
    });
  }


  return service;
}

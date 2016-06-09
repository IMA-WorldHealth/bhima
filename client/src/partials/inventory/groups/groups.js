angular.module('bhima.controllers')
.controller('InventoryGroupsController', InventoryGroupsController);

// dependencies injection
InventoryGroupsController.$inject = [
  '$translate', 'InventoryService', 'NotifyService', 'uiGridConstants', 'ModalService'
];

/**
 * Inventory Group Controller ]
 * This controller is responsible for handling inventory group module
 */
function InventoryGroupsController($translate, Inventory, Notify, uiGridConstants, Modal) {
  var vm = this;

  /** paths in the headercrumb */
  vm.bcPaths = [
    { label : 'TREE.INVENTORY' },
    { label : 'TREE.INVENTORY_GROUP' }
  ];

  /** buttons in the headercrumb */
  vm.bcButtons = [{
    icon: 'fa fa-plus',
    label: $translate.instant('FORM.LABELS.ADD'),
    action: addInventoryGroup, color: 'btn-primary'
  }];

  /** add inventory group */
  function addInventoryGroup() {
    return;
  }

}

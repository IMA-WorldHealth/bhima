angular.module('bhima.controllers')
.controller('FeeCenterController', FeeCenterController);

FeeCenterController.$inject = ['FeeCenterService', 'NotifyService', '$state', 'SessionService'];

function FeeCenterController(FeeCenterService, Notify, $state, Session) {
  let vm = this;

  vm.enterprise = Session.enterprise;


  let columns = [
      { field : 'label', displayName : 'FORM.LABELS.TEXT',
        headerCellFilter: 'translate', cellFilter: 'translate'},

      { field : 'principalState', displayName : 'FORM.LABELS.PRINCIPAL',
        headerCellFilter: 'translate'},

      { field : 'value', displayName : 'FORM.LABELS.VALUE',
        headerCellFilter: 'translate',
        cellFilter: 'currency:' + vm.enterprise.currency_id},

      { field : 'name', displayName : 'FORM.LABELS.PROJECT',
        headerCellFilter: 'translate'},

      { field : 'info', displayName : 'TABLE.COLUMNS.NOTE', headerCellFilter: 'translate',
        cellTemplate : '/partials/templates/grid/fee_center_info.cell.html'},

      { field : 'action', displayName : '...',
        cellTemplate : '/partials/templates/grid/fee_center_action.cell.html',
        enableFiltering: false,
        enableColumnMenu: false
      }
  ];

  vm.gridOptions = {
    enableColumnMenus: false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider: vm,
    columnDefs : columns
  };
  vm.loading = true;

  function edit(feeCenter) {
    $state.go('feeCenter.edit', {id : feeCenter.id, creating : false}, {reload : false});
  }

  function startup() {
    FeeCenterService.read(null, { detailed : 1})
    .then(function (list) {
      vm.gridOptions.data = FeeCenterService.formatRecord(list);
    })
    .catch(function (error){
      vm.hasError = true;
      Notify.handleError(error);
    })
    .finally(function(){
      vm.loading = false;
    });
  }

  // startup the module
  startup();

  vm.edit = edit;
}

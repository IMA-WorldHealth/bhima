angular.module('bhima.controllers')
  .controller('IndicatorsController', IndicatorsController);

IndicatorsController.$inject = [
  'NotifyService', 'IndicatorService', 'ModalService',
];

function IndicatorsController(Notify, Indicator, Modal) {
  const vm = this;

  const columns = [{
    field : 'label',
    displayName : 'FORM.LABELS.NAME',
    headerCellFilter : 'translate',
  }, {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/roles/templates/action.cell.html',
  }];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    data : [],
    wastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  vm.addHospialization = (data) => {
    Modal.openHostpitaliationIndicator(data).then(changes => {
      if (changes) {
        // load data
      }
    });
  };

}

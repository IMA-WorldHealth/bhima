'use strict';

// controller definition
angular.module('bhima.controllers')
.controller('FeeCenterController', FeeCenterController);

// dependencies injection
FeeCenterController.$inject = ['FeeCenterService', 'NotifyService','$state'];

/** Transaction Type Controller  */
function FeeCenterController(FeeCenterService, Notify, $state) {
  var vm = this;

  // edit button template
  var actionTemplate = '<div class="ui-grid-cell-contents">' +
    '<a href="" id="edit-link" title="{{ \'FORM.LABELS.EDIT\' | translate }}" ng-click="grid.appScope.edit(row.entity)"> ' +
    '<i class="fa fa-edit"></i>{{ "FORM.LABELS.EDIT" | translate }}</a>|' +
    '<a ng-if="row.entity.is_principal !==1" href="" title="{{ \'FORM.LABELS.ASSIGN\' | translate }}" ng-click="grid.appScope.editFeeCenter(row.entity)"> ' +
    '<i class="fa fa-share-alt"></i>{{ "FORM.LABELS.ASSIGN" | translate }}</a>' +
    '</div>';

  var infoTemplate = '<div class="ui-grid-cell-contents">' +
    '<a href="" uib-popover="{{grid.appScope.showNote(row.entity.note)}}" ' +
    'popover-placement="left"' +
    'popover-trigger="\'mouseenter\'"' +
    'popover-append-to-body="true"' +
    'data-edit-type="{{ row.entity.label }}">' +
    '<i class="fa fa-info-circle" aria-hidden="true"></i>' +
    '</a></div>';

  var columns = [
      { field : 'label', displayName : 'FORM.LABELS.TEXT',
        headerCellFilter: 'translate', cellFilter: 'translate'},

      { field : 'is_cost', displayName : 'FORM.LABELS.TYPE',
        headerCellFilter: 'translate',
        cellTemplate: 'partials/templates/grid/feeCenterType.tmpl.html'},

      { field : 'principalState', displayName : 'FORM.LABELS.PRINCIPAL',
        headerCellFilter: 'translate'},

      { field : 'name', displayName : 'FORM.LABELS.PROJECT',
        headerCellFilter: 'translate'},

      { field : 'info', displayName : 'TABLE.COLUMNS.NOTE', headerCellFilter: 'translate',
        cellTemplate : infoTemplate},

      { field : 'action', displayName : '...',
        cellTemplate: actionTemplate,
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

  function showNote(note) {
    return note;
  }

  function startup() {
    FeeCenterService.fullRead()
    .then(function (list) {
      vm.gridOptions.data = FeeCenterService.formatRecord(list);
    })
    .catch(Notify.handleError)
    .finally(function(){
      vm.loading = false;
    });
  }

  // startup the module
  startup();

  vm.showNote = showNote;
  vm.edit = edit;
}

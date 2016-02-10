/**
 * @todo Known bug - if the sidebar is expanded and collapsed to totals footer 
 * will not refresh to the correct size (fixed width is not recalculated)
 */
angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['$http', 'uuid', 'InventoryItems', 'uiGridConstants'];

function PatientInvoiceController($http, uuid, InventoryItems, uiGridConstants) { 
  var vm = this;
  
  // Set default invoice date to today 
  vm.invoiceDate = new Date();
  vm.invoiceId = uuid();

  // FIXME 
  vm.distributable = "true";
  vm.itemIncrement = 1;

  // TODO 02/08 - Replace with Dedrick's service API
  $http.get('services')
    .then(function (services) { 
      vm.services = services.data;

      // Select default service
      vm.service = vm.services[0];
    });

  // TODO rename list
  var saleData = InventoryItems.current.data;
  vm.availableInventoryItems = InventoryItems.available;
  
  
  var mockOptions = { 
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    // showGridFooter : true,
    // gridFooterTemplate : footer,
    // onRegisterApi : validate,
    // footerTemplate : 'partials/patient_invoice/templates/footer.tmpl.html',
    // showColumnFooter : true,
    columnDefs : [
      { field : 'status',
        displayName : '',
        width : '25',
        cellTemplate : 
          '<div ng-if="!row.entity.confirmed" class="bg-danger" style="padding : 5px;"><span class="text-danger glyphicon glyphicon-remove-sign"></span></div>' + 
          '<div ng-if="row.entity.confirmed" class="bg-success" style="padding : 5px;"><span class="text-success glyphicon glyphicon-ok-sign"></span></div>'
      },
      { 
        field : 'code',
        cellTemplate : '<div style="padding : 5px;">' + 
          '<div ng-if="!row.entity.confirmed">' + 
          '<input class="form-control" typeahead-append-to-body="true" uib-typeahead="item.uuid as (item.label + \' [\' + item.code + \']\') for item in grid.appScope.availableInventoryItems()" ng-model="row.entity.inventoryUuid" typeahead-on-select="grid.appScope.confirmItem(row.entity)"></input>'+ 
          '</div>' + 
          '<div nf-if="row.entity.confirmed">' + 
          '<p>{{row.entity.code}}</p>' +
          '</div>'
        },
      { field : 'description' },
      { field : 'quantity', 
        cellTemplate : '<div style="padding : 5px;"><input min="0" type="number" ng-disabled="!row.entity.confirmed" class="form-control" style="padding-left : 5px !important" ng-model="row.entity.quantity"></input></div>'
        // cellFooterTemplate : '<div>eh</div>',
        // aggregationType : uiGridConstants.aggregationTypes.sum
      },
      { field : 'unit_price', 
        cellTemplate : '<div style="padding : 5px;"><input type="number" ng-disabled="!row.entity.confirmed" class="form-control" style="padding-left : 5px !important" ng-model="row.entity.unit_price"></input></div>'},
      { field : 'amount',
        cellTemplate : '<div style="padding : 5px;">{{row.entity.quantity * row.entity.unit_price | currency}}</div>'},
      { field : 'actions',
        width : 25,
        cellTemplate : '<div style="padding : 5px;"><a href="" ng-click="grid.appScope.InventoryItems.removeItem(row.entity)"><span class="glyphicon glyphicon-trash"></span></a></div>'}
    ],
    data : saleData
  };
  
  // TODO Move this code - initial inventory item 
  // this.addItem();

  // TODO 
  // Quantity should be required to be whole integer 
  // Unit price should be number

  vm.mockOptions = mockOptions;
  vm.saleData = saleData;

  // TODO Move to items service
  vm.addInventoryItem = function addInventoryItem(totalItems) { 
    var totalItems = totalItems || 1;

    // console.log(vm.availableInventoryItems());
    // TODO Validate total items is a reasonable value

    for (var i = 0; i < totalItems; i++) { 
      InventoryItems.addItem();
      // saleData.push({});
    }
  }

  vm.setPatient = function setPatient(patient) { 
    // Prompt initial invoice item
    vm.addInventoryItem();
    
    vm.invoicePatient = patient;
  }

  vm.confirmItem = function confirmItem(item) { 
    InventoryItems.confirmItem(item);
    // console.log('confirming inventory item');
  }

  vm.returnTotal = InventoryItems.total;
  vm.inventoryItemAvailable = InventoryItems.inventoryItemAvailable;

  vm.InventoryItems = InventoryItems;
  //vm.addInventoryItem();

  // Debug method - TODO Remove
  vm.viewItems = function viewItems() { 
    console.log(saleData);
  } 
  
  window.gridOptions = mockOptions;
}

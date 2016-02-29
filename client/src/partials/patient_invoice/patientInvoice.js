/**
 * @todo Known bug - if the sidebar is expanded and collapsed to totals footer 
 * will not refresh to the correct size (fixed width is not recalculated)
 */
angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['$http', '$q', 'uuid', 'uiGridConstants', 'Patients', 'PriceLists', 'Invoice'];

function PatientInvoiceController($http, $q, uuid, uiGridConstants, Patients, PriceLists, Invoice) { 
  var vm = this;

  // 1. Allow generic configuration of page - all financial details wait on the patient to be invoiced to be set 
  // 2. Patient being selected will trigger all other actions
  // 3. Billing services downloaded for patient 
  // 4. Price lists downloaded for patient 
  // 5. Invoice.items service initialised with price list and billing services prices in as optional parameters 
  //    (These will need to be included in the price of quanities as well as the total calculation)
  // 6. Submit sale simply collects form information and request InventoryItem.formatSumbitted()
 
  // Personal TODO
  // Extend and write 
  // patient/:uuid/billing_services
  // patient/:uuid/price_lists
  // patient/:uuid/subsidies
  
   
  // Set default invoice date to today 
  vm.invoiceDate = new Date();
  vm.invoiceId = uuid();

  // FIXME FIXME
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
  
  // var items = new IntentoryItems();
  // console.log('initialised new items', items);
 
  // TODO Initialise per session
  vm.Invoice = Invoice;
  vm.Invoice.items = vm.Invoice.items;

  var saleData = vm.Invoice.items.current.data;
  
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
          '<input class="form-control" typeahead-append-to-body="true" uib-typeahead="item.uuid as (item.label + \' [\' + item.code + \']\') for item in grid.appScope.Invoice.items.available()" ng-model="row.entity.inventoryUuid" typeahead-on-select="grid.appScope.Invoice.items.confirmItem(row.entity)"></input>'+ 
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
        cellTemplate : '<div style="padding : 5px;"><input min="0" type="number" ng-disabled="!row.entity.confirmed" class="form-control" style="padding-left : 5px !important" ng-model="row.entity.unit_price"></input></div>'},
      { field : 'amount',
        cellTemplate : '<div style="padding : 5px;">{{row.entity.quantity * row.entity.unit_price | currency}}</div>'},
      { field : 'actions',
        width : 25,
        cellTemplate : '<div style="padding : 5px;"><a href="" ng-click="grid.appScope.Invoice.items.removeItem(row.entity)"><span class="glyphicon glyphicon-trash"></span></a></div>'}
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

  vm.setPatient = function setPatient(patient) { 

    // TODO (remove comment) set up for when patient find directive only returnd uuid to be referenced
    var uuid = patient.uuid;

    Patients.detail(uuid)
      .then(configureInvoice);
  }

  // This is done in the controller because the invoice service would become strictly 
  // tied  to debitors given this code 
  // TODO potentially move this into debitor configuration within invoice
  // TODO very temporary code
  function configureInvoice(patient) { 
    var configureQueue = [];

    // Prompt initial invoice item
    Invoice.items.addInventoryItem();
  
    // TODO Temporary API tests
    configureQueue.push(
      Patients.billingServices(patient.uuid)
    );

    configureQueue.push(
      Patients.subsidies(patient.uuid)
    );

    if (patient.price_list_uuid) { 
      configureQueue.push(
        PriceLists.detail(patient.price_list_uuid)
      );
    }
    
    $q.all(configureQueue)
      .then(function (result) { 
        var billingResult = result[0];
        var subsidiesResult = result[1];
        var priceListResult = result[2];
     
        console.log('config queue completed', result);
        vm.Invoice.configureGlobalCosts(billingResult, subsidiesResult);


        vm.invoicePatient = patient;
      });
      // .then(function (result) { 
        // console.log('got patient subsidies');
        // console.log(result);
      // });
    
    // console.log('current patient is', patient);
    // Information is required to know if we should be applying subsidies, 
    // billing services and discounts
    
            // .then(function (result) { 
          // console.log('got price list');
          // console.log(result);
        // });
    // }
  }
  
  
  window.gridOptions = mockOptions;
}

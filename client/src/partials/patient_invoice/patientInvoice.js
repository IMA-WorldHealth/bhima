/**
 * @todo Known bug - if the sidebar is expanded and collapsed to totals footer 
 * will not refresh to the correct size (fixed width is not recalculated)
 */
angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['$http', '$q', 'uuid', 'uiGridConstants', 'Patients', 'PriceLists', 'Invoice'];

function PatientInvoiceController($http, $q, uuid, uiGridConstants, Patients, PriceLists, Invoice) { 
  var vm = this;
  
  // TODO 1. Billing services and subsidies must be shut down according to debtor information 
  // TODO 2. Submit sale simply collects form information and request InventoryItem.formatSumbitted()
 
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

  // TODO Initialise per session
  vm.Invoice = Invoice;
  vm.Invoice.items = vm.Invoice.items;

  var gridOptions = { 
    appScopeProvider : vm,
    enableSorting : false,
    enableColumnMenus : false,
    columnDefs : [
      {field : 'status', width : 25, displayName : '', cellTemplate : 'partials/patient_invoice/templates/grid/status.tmpl.html'},
      {field : 'code', cellTemplate :  'partials/patient_invoice/templates/grid/code.tmpl.html'},
      {field : 'description'},
      {field : 'quantity', cellTemplate : 'partials/patient_invoice/templates/grid/quantity.tmpl.html'},
      {field : 'unit_price', cellTemplate : 'partials/patient_invoice/templates/grid/unit.tmpl.html'},
      {field : 'amount', cellTemplate : 'partials/patient_invoice/templates/grid/amount.tmpl.html'},
      {field : 'actions', width : 25, cellTemplate : 'partials/patient_invoice/templates/grid/actions.tmpl.html'}
    ],
    data : vm.Invoice.items.current.data
  };
  
  vm.gridOptions = gridOptions;
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
     
        vm.Invoice.configureGlobalCosts(billingResult, subsidiesResult);
        vm.Invoice.items.setPriceList(priceListResult);
        vm.invoicePatient = patient;
      });
  }
}

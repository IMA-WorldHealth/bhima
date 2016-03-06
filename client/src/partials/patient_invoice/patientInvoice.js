/**
 * @todo Known bug - if the sidebar is expanded and collapsed to totals footer 
 * will not refresh to the correct size (fixed width is not recalculated)
 */

// TODO Caching inventory items - if items are cleared or page reloaded they can be loaded back,
//  - with prices?
//
// TODO Tabbing through UI grid - it's essential to be able to tab through 
// code -> Quantity -> Price 
// code -> Quantity -> Price 
// etc. 
angular.module('bhima.controllers')
.controller('PatientInvoiceController', PatientInvoiceController);

PatientInvoiceController.$inject = ['$http', '$q', 'uuid', 'uiGridConstants', 'Patients', 'PriceLists', 'Invoice', 'util', 'moment'];

function PatientInvoiceController($http, $q, uuid, uiGridConstants, Patients, PriceLists, Invoice, util, moment) { 
  console.log(util);
  var vm = this;
  
  // TODO 1. Billing services and subsidies must be shut down according to debtor information 
  // TODO 2. Submit sale simply collects form information and request InventoryItem.formatSumbitted()
 
  vm.Invoice = Invoice;
  
  
  // TODO 02/08 - Replace with Dedrick's service API
  $http.get('services')
    .then(function (services) { 
      vm.services = services.data;

      // Select default service
      // TODO
      vm.Invoice.details.service = vm.services[0];
    });

  // TODO Initialise per session
  vm.Invoice.items = vm.Invoice.items;

  function handleGridApi(gridApi) { 
    console.log('handle grid api');

    // expose grid api
    vm.gridApi = gridApi;
  }

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
    onRegisterApi : handleGridApi,
    data : vm.Invoice.items.current.data
  };

    
  vm.gridOptions = gridOptions;
  vm.setPatient = function setPatient(patient) { 

    // TODO (remove comment) set up for when patient find directive only returnd uuid to be referenced
    var uuid = patient.uuid;

    Patients.detail(uuid)
      .then(configureInvoice);
  }

  vm.submit = function submit(detailsForm) { 
    // console.log('got sale details form', detailsForm);
    
    detailsForm.$setSubmitted();
  
    // Ask service items to validate themselves - if anything is returned it is invalid
    var invalidItem = vm.Invoice.items.verify();
    
    if (angular.isDefined(invalidItem)) { 
      console.log('there was a problem with an item!');
      
      console.log(vm.gridApi);

      // show the user where the error is
      vm.gridApi.core.scrollTo(invalidItem);
      
      return;
    }
      
    console.log('everything must be valid!');

    // If everything is okay - clear the invoice items cache
    // (this should be done on return)
    handleCompleteInvoice();
  }

  function handleCompleteInvoice() { 
    vm.Invoice.items.removeCache(); 
  }
  
  // Reset everything in the controller
  vm.clear = function clear() { 
    
    // Default values
    // Set default invoice date to today 
    vm.Invoice.details.date = new Date();
    vm.invoiceId = uuid();

    // FIXME FIXME
    vm.distributable = "true";
    vm.itemIncrement = 1;
    vm.timestamp = new moment();
    vm.minimumDate = util.minimumDate;

    vm.dateLocked = true;
    
    if (vm.services) { 
      vm.Invoice.details.service = vm.services[0];
    }

    if (vm.patientSearch) { 
      vm.patientSearch.reset();
    }
    vm.Invoice.recipient = null;
    vm.Invoice.items.recovered = false;
    vm.Invoice.items.removeItems(true, false);
  };

  //FIXME
  vm.clear();

  // This is done in the controller because the invoice service would become strictly 
  // tied  to debitors given this code 
  // TODO potentially move this into debitor configuration within invoice
  // TODO very temporary code
  function configureInvoice(patient) { 
    var configureQueue = [];
    
    // console.log('patient search', vm.patientSearch);
    // vm.patientSearch.reset();

    // Prompt initial invoice item
    Invoice.items.configureBase();
  
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
        vm.Invoice.recipient = patient;
      });
  }
}

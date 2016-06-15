angular.module('bhima.controllers')
.controller('InvoiceRegistryController', InvoiceRegistryController);

InvoiceRegistryController.$inject = [
  'PatientInvoiceService', '$uibModal', 'NotifyService', 'util'
];

/**
 * Invoice Registry Controller
 *
 * This module is responsible for the management
 * of Invoice Registry.
 *
 */
function InvoiceRegistryController(Invoices, $uibModal, Notify, util) {
    var vm = this;

    var invoiceActionsTemplate =
        '<div style="padding : 5px"><a ui-sref="invoiceRecord.details({invoice_uuid : row.entity.uuid})"><span class="glyphicon glyphicon-list-alt"></span> {{ "INVOICE_REGISTRY.RECORD" | translate }}</a> <a ui-sref="invoiceEdit({uuid : row.entity.uuid})"><span class="glyphicon glyphicon-edit"></span> {{ "TABLE.COLUMNS.EDIT" | translate }}</a></div>';


    vm.search = search;
    vm.momentAge = util.getMomentAge;

    // track if module is making a HTTP request for invoices
    vm.loading = false;

    //setting columns names
    vm.uiGridOptions = {
        appScopeProvider : vm,
        enableColumnMenus : false,
        columnDefs : [
            { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
            { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate' },
            { field : 'patientNames', displayName : 'TABLE.COLUMNS.PATIENT', headerCellFilter : 'translate' },
            { field : 'cost', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate'  },
            { field : 'serviceName', displayName : 'TABLE.COLUMNS.SERVICE', headerCellFilter : 'translate'  },
            { field : 'createdBy', displayName : 'TABLE.COLUMNS.BY', headerCellFilter : 'translate' },
            { name : 'Actions', displayName : '', cellTemplate : invoiceActionsTemplate }
        ],
        enableSorting : true
    };

    function handler(error) {
        vm.hasError = true;
        Notify.handleError(error);
    }

    // load Invoice Registry Grid
    function loadGrid() {
        vm.loading = true;
        vm.hasError = false;

        Invoices.read()
            .then(function (invoices) {
                invoices.forEach(function (invoice) {
                    invoice.date = util.getMomentAge(invoice.date);
                });
                vm.uiGridOptions.data = invoices;
            })
            .catch(handler)
            .finally(function () {
                vm.loading = false;
            });
    }

    // Search and filter data in invoices Registry
    function search() {
        vm.loading = true;
        vm.hasError = false;
        Invoices.openSearchModal()
            .then(function (data) {
              var response = data.response;
              vm.filters = data.filters;
              response.forEach(function (invoice) {
                invoice.invoiceAge = util.getMomentAge(invoice.date);
              });
              vm.uiGridOptions.data = response;
            })
            .catch(handler)
            .finally(function () {
              vm.loading = false;
            });
    }

    // fire up the module
    loadGrid();
  
  
}

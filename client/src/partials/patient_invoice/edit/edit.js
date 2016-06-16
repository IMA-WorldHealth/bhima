angular.module('bhima.controllers')
    .controller('InvoiceEditController', InvoiceEditController);

InvoiceEditController.$inject = [
    '$stateParams', 'PatientInvoiceService', 'util', 'moment', 'NotifyService', 'ScrollService'
];

function InvoiceEditController($stateParams, invoices, util, moment, Notify, ScrollTo) {
    var vm = this;
}

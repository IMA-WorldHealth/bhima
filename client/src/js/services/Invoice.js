'use strict';

angular.module('bhima.services')
  .service('Invoice', Invoice);

Invoice.$inject = ['InvoiceItems'];

function Invoice(InvoiceItems) { 
  // Accept billing serivces, subsidies + price lists 
  // Price lists passed to inventory items 
  // calculate total facotrs in subsidies + billing services
}

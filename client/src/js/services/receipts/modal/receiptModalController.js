angular.module('bhima.controllers')
.controller('ReceiptModalController', ReceiptModalController);

ReceiptModalController.$inject = ['receipt'];

/**
 * Receipt Modal Controller 
 *
 * @params {Object} receipt   An object containing the receipt request (formatted
 *                            by the service wrapping the receipt modal). The promise
 *                            is stored in an object to ensure the modal is evaluated 
 *                            before the HTTP request (promise) is resolved.
 */
function ReceiptModalController(receipt) { 
  
  receipt.promise
    .then(function (result) { 
      
      // receipt has successfully loaded
      
    })
    .catch(function (error) { 
      
      // receipt has failed - show error state
    });
}

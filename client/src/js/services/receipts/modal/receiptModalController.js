angular.module('bhima.controllers')
.controller('ReceiptModalController', ReceiptModalController);

ReceiptModalController.$inject = ['receipt', 'template', 'render'];

/**
 * Receipt Modal Controller 
 *
 * @params {Object} receipt   An object containing the receipt request (formatted
 *                            by the service wrapping the receipt modal). The promise
 *                            is stored in an object to ensure the modal is evaluated 
 *                            before the HTTP request (promise) is resolved.
 * @params {String} template  Path to the template or resource to load 
 * @params {String} render    Render target used to generate report 
 */
function ReceiptModalController(receipt, template, render) { 
  var vm = this;
  vm.target = template;
  vm.renderer = render;
  vm.receipt = receipt;

  console.log(render);
  receipt.promise
    .then(function (result) { 
      
      // receipt has successfully loaded
      
    })
    .catch(function (error) { 
      
      // receipt has failed - show error state
    });
}

angular.module('bhima.controllers')
.controller('ReceiptModalController', ReceiptModalController);

ReceiptModalController.$inject = ['$uibModalInstance', '$window', 'receipt', 'options'];

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
function ReceiptModalController($modalInstance, $window, receipt, options) { 
  var vm = this;
  
  // expose options to the view
  angular.extend(vm, options);

  receipt.promise
    .then(function (result) { 
      
      // receipt has successfully loaded
      vm.receipt = result;
    })
    .catch(function (error) { 
      
      // receipt has failed - show error state
    });

  vm.print = function print() { 
    $window.print();
  };
  
  vm.close = function close() { 
    $modalInstance.close();
  };
}

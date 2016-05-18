angular.module('bhima.controllers')
.controller('ReceiptModalController', ReceiptModalController);

ReceiptModalController.$inject = ['$uibModalInstance', '$window', '$sce','receipt', 'options'];

/**
 * Receipt Modal Controller
 *
 * @param {Object} receipt   An object containing the receipt request (formatted
 *                            by the service wrapping the receipt modal). The promise
 *                            is stored in an object to ensure the modal is evaluated
 *                            before the HTTP request (promise) is resolved.
 * @params {String} template  Path to the template or resource to load
 * @params {String} render    Render target used to generate report
 */
function ReceiptModalController($modalInstance, $window, $sce, receipt, options) {
  var vm = this;

  // expose options to the view
  angular.extend(vm, options);

  receipt.promise
    .then(function (result) {

      // receipt has successfully loaded
      // vm.receipt = result;

      var file = new Blob([result], {type : 'application/pdf'});
      var fileURL = URL.createObjectURL(file);

      vm.receipt = $sce.trustAsResourceUrl(fileURL);
      console.log(vm.receipt);
    })
    .catch(function (error) {

      // receipt has failed - show error state
    });

  vm.print = function print() {

    // special case for embedded content
    if (options.renderer === 'pdf') {
      $window.frames.pdf.contentWindow.print();
      return;
    }
    $window.print();
  };

  vm.close = function close() {
    $modalInstance.close();
  };
}

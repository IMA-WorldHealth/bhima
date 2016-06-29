angular.module('bhima.controllers')
.controller('ReportsModalController', ReportsModalController);

// dependencies injection
ReportsModalController.$inject = [
  'ReceiptService', '$uibModalInstance', '$sce',
  '$window', 'data'];

/**
 * Reports Modal Controller
 * This controller is responsible display document as report
 */
function ReportsModalController(Receipts, Instance, $sce, $window, Data) {
  var vm = this;

  vm.renderer = Data.renderer;

  if (vm.renderer === 'pdf') {

    // store downloaded base64 PDF file in a browser blob - this will be accessible through 'blob://...'
    var file = new Blob([Data.report], { type : 'application/pdf'});

    // determine the direct path to the newly (temporarily) stored PDF file
    var fileURL = URL.createObjectURL(file);

    // trust and expose the file to the view to embed the PDF
    vm.report = $sce.trustAsResourceUrl(fileURL);
  } else {
    // simply expose receipt object to view
    vm.report = Data.report;
  }

  // Instance manipulation
  vm.close = function close() {
    Instance.close();
  };

  vm.print = function () {
    if (vm.renderer === 'pdf') {
      return $window.frames.pdf.contentWindow.print();
    } else {
      $window.print();
    }
    Instance.close();
  };
}

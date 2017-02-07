angular.module('bhima.controllers')
.controller('ReportsModalController', ReportsModalController);

// dependencies injection
ReportsModalController.$inject = [
  '$http', '$uibModalInstance', '$sce',
  '$window', 'data', 'NotifyService', 'util'];

/**
 * Reports Modal Controller
 * This controller is responsible display document as report
 */
function ReportsModalController($http, Instance, $sce, $window, Data, Notify, util) {
  var vm = this;

  vm.loading  = true;
  vm.params   = Data.params;
  vm.renderer = Data.params && Data.params.renderer ? Data.params.renderer : Data.renderer;

  // Requesting the report
  reportRequest(Data.url, vm.renderer)
  .then(function (report) {

    if (vm.renderer === 'pdf') {

      // store downloaded base64 PDF file in a browser blob - this will be accessible through 'blob://...'
      var file = new Blob([report], { type : 'application/pdf'});

      // determine the direct path to the newly (temporarily) stored PDF file
      var fileURL = URL.createObjectURL(file);

      // trust and expose the file to the view to embed the PDF
      vm.report = $sce.trustAsResourceUrl(fileURL);

    } else {
      // simply expose receipt object to view
      vm.report = report;
    }

    // stop the loading indicator
    vm.loading = false;

  })
  .catch(Notify.handleError);

  function reportRequest(url, filetype) {

    // filetype setup
    var responseType = filetype === 'pdf' ? 'arraybuffer' : null;
    var params = { renderer: filetype };
    angular.extend(params, vm.params);

    // send the GET request
    return $http.get(url, {
      params: params,
      responseType: responseType
    })
    .then(util.unwrapHttpResponse);
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

angular.module('bhima.controllers')
  .controller('CDRReportingPeremptionRateController', CDRReportingPeremptionRateController);

CDRReportingPeremptionRateController.$inject = [
  'CdrDepotService', 'NotifyService', '$sce',
];

function CDRReportingPeremptionRateController(
  Depots, Notify, $sce,
) {
  const vm = this;

  vm.loadReport = loadReport;
  vm.download = download;
  vm.recomputeInContext = recomputeInContext;

  Depots.getAvailableYears()
    .then(years => {
      vm.availableYears = years.map(item => item.annee);
    })
    .catch(Notify.handleError);

  function loadReport() {

    // need to select a year before this will fire.
    if (!vm.selectedYear) {
      return;
    }

    vm.loading = true;

    Depots.getPeremptionReport({ year : vm.selectedYear, recompute : vm.recompute })
      .then(report => {
        vm.report = $sce.trustAsHtml(report);
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function download(year) {
    return Depots.downloadReport(year);
  }

  function recomputeInContext() {
    if (vm.recompute) {
      loadReport();
    }
  }
}

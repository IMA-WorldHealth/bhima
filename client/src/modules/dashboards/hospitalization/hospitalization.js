angular.module('bhima.controllers')
  .controller('HospitalizationDashboardController', HospitalizationDashboardController);

HospitalizationDashboardController.$inject = [
  'IndicatorsDashboardService', 'NotifyService',
];

function HospitalizationDashboardController(IndicatorsDashboard, Notify) {
  const vm = this;
  const current = new Date();
  const year = current.getFullYear();
  vm.search = { date : current };
  vm.selected = { dateFrom : new Date(`${year}-01-01`), dateTo : new Date(`${year}-12-31`) };

  vm.onChangeFilter = selected => {
    const params = {};

    if (selected.service === null) {
      delete vm.selected.service_id;
      delete vm.selected.service;
    }

    if (selected.service && selected.service.id) {
      params.service_id = selected.service.id;
      vm.selected.service = selected.service;
    }

    if (selected.dateFrom) {
      params.start_date = vm.selected.dateFrom;
    }

    if (selected.dateTo) {
      params.end_date = vm.selected.dateTo;
    }

    angular.extend(vm.selected, params);
    load(vm.selected);
  };

  function load(options) {
    IndicatorsDashboard.dashboards.read(null, options)
      .then(indicators => {
        vm.indicators = indicators.hospitalization;
      })
      .catch(Notify.errorHandler);
  }

  load(vm.selected);
}

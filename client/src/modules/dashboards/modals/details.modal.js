angular.module('bhima.controllers')
  .controller('IndicatorDetailsModalController', IndicatorDetailsModalController);

IndicatorDetailsModalController.$inject = [
  'data', '$uibModalInstance', '$timeout', 'moment',
];

function IndicatorDetailsModalController(Data, Instance, $timeout, moment) {
  /* global muze */
  const vm = this;
  vm.params = Data;
  vm.close = Instance.close;

  function orderPeriods(periodicValues) {
    return (periodicValues || []).sort(compare);
  }

  function compare(_a, _b) {
    const a = new Date(_a.period);
    const b = new Date(_b.period);
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  }

  function formatPeriod(row) {
    row.period = moment(row.period).format('MMMM YYYY');
    return row;
  }

  function drawChart() {
    const unorderedData = orderPeriods(vm.params.periodicValues) || [{ value : 0, period : 0 }];
    const data = unorderedData.map(formatPeriod);
    const schema = [
      { name : 'value', type : 'measure' },
      { name : 'period' },
    ];

    const { DataModel } = muze;
    const dm = new DataModel(data, schema);

    const env = muze(); // Initialize the Muze environment
    const canvas = env.canvas(); // Create a container canvas

    $timeout(() => {
      canvas
        .data(dm)
        .width(600) // Specify width of visualization (canvas) in pixels
        .height(400) // Specify height of visualization (canvas) in pixels
        .rows(['value'])
        .columns(['period'])
        .mount('#indicator-chart');
    }, 0);
  }

  drawChart();
}

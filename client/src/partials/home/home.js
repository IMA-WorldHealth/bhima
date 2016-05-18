angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService', 'SystemService', '$interval', '$translate'
];

/**
 * Home Controller (system dashboard)
 *
 * This controller powers the system dashboard shown by default when the  user
 * signs in.
 */
function HomeController(Currencies, Rates, Session, System, $interval, $translate) {
  var vm = this;

  vm.today = new Date();

  // bind the session information
  vm.project = Session.project;
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;
  vm.graph = {};

  // load exchange rates
  Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies.filter(function (currency) {
        return currency.id !== Session.enterprise.currency_id;
      });

      // format the enterprise currency
      vm.enterprise.currencyLabel = Currencies.format(vm.enterprise.currency_id);

      // load supported rates
      return Rates.read(true);
    })
    .then(function () {
      vm.currencies.forEach(function (currency) {
        currency.rate = Rates.getCurrentRate(currency.id);
      });
    });

  // loads system information from the server
  function loadSystemInformation() {
    System.information()
      .then(function (data) {
        vm.system = data;
      });
  }

  // initialize with data
  loadSystemInformation();

  // set up an interval to periodically reload the system information data
  // (every five seconds)
  $interval(loadSystemInformation, 5000, false);

  System.events()
    .then(function (events) {
      vm.events = events;
    });


  // FAKE GRAPH STUFF

  function randomWalk(initial, duration) {

    // temp variables
    var position = initial;
    var i = 0;
    var stepSize = 15;
    var walk = [];

    // actually walk
    while (i++ <= duration) {

      // random steps
      var r = Math.random() >= 0.5 ? 1 : -1;
      position += r*stepSize;

      // random jumps
      var n = Math.random() >= 0.9;
      var q = Math.random() >= 0.5 ? 1.45 : 0.65;

      if (n) {
        position *= q;
        position = Math.round(position);
      }

      walk.push(position);
    }

    // return the walk
    return walk;
  }

  var i = 24;
  var labels = [];
  do { labels.push(i + ' hrs'); } while (i--);
  labels[labels.length - 1] = 'now';

  function randInRange(min, max) {
    return Math.floor(Math.random()*(max-min) + min);
  }

  // fake dataset generation
  function generateFakeGraphDataset() {
    var min = 25;
    var max = 500;
    var walk = randomWalk(randInRange(min, max), 24);

    // make sure these are positive
    return walk.map(function (step) {
      return step > 0 ? step : step * -1;
    });
  }

  // IMA colors
  var green = 'rgba(120, 162, 63, 1)';
  var orange = 'rgba(229, 123, 20, 1)';
  var darkblue = 'rgba(8, 84, 132, 1)';
  var lightorange = 'rgba(253, 186, 100, 1)';
  var lightblue = 'rgba(111, 189, 238, 1)';

  vm.charts = [{
    label: 'GRAPHS.LOGINS',
    data: [generateFakeGraphDataset()],
    colors: [{ pointBorderColor:green, borderColor: green, backgroundColor: 'rgba(120, 162, 63, 0.2)' }]
  }, {
    label: 'GRAPHS.PATIENT_REGISTRATIONS',
    data: [generateFakeGraphDataset()],
    colors: [{ pointBorderColor:orange, borderColor: orange, backgroundColor: 'rgba(229, 123, 20, 0.2)' }]
  }, {
    label: 'GRAPHS.PATIENT_INVOICES',
    data: [generateFakeGraphDataset()],
    colors: [{ pointBorderColor:darkblue, borderColor: darkblue, backgroundColor: 'rgba(8, 84, 132, 0.2)' }],
  }, {
    label: 'GRAPHS.MEDICINE_DISTRIBUTIONS',
    data: [generateFakeGraphDataset()],
    colors: [{ pointBorderColor:lightorange, borderColor: lightorange, backgroundColor: 'rgba(253, 186, 100, 0.2)'}]
  }];

  // temp select chart fn
  vm.selectChart = function selectChart(chart) {
    vm.graph = chart;
    vm.graph.labels = labels;
    vm.graph.series = [$translate.instant(chart.label)];
    vm.graph.options = { legend : { display : false }};
    vm.selected = chart.label;
  };

  // default select a chart
  vm.selectChart(vm.charts[0]);
}

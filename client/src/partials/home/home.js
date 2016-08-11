angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService', 'SystemService',
  '$interval', '$translate', '$scope', 'NotifyService', 'FiscalService'
];

/**
 * Home Controller (system dashboard)
 *
 * This controller powers the system dashboard shown by default when the user
 * signs in. This is currently not very informative since the system is missing
 * the infrastructure to power the dashboard completely.
 *
 * @todo - remove the fake graph generation code and replace with actual system
 * activity, such as patient registrations.
 * @todo - implement fiscal year client-side services to get relevant fiscal year
 * services and information.
 */
function HomeController(Currencies, Rates, Session, System, $interval, $translate, $scope, Notify, Fiscal) {
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
    })
    .catch(Notify.handleError);

  // loads system information from the server
  function loadSystemInformation() {
    System.information()
      .then(function (data) {
        vm.system = data;
      });
  }

  Fiscal.fiscalYearDate({ date : vm.today })
    .then(function (year) {
      vm.year = year[0];
      vm.year.percentage = vm.year.percentage * 100;
    })
    .catch(Notify.handleError);


  // initialize with data
  loadSystemInformation();

  // set up an interval to periodically reload the system information data
  // (every five seconds)
  var poll = $interval(loadSystemInformation, 5000, false);

  // make sure the polling is cleaned up on the $rootChange and the controller's
  // $scope is destroyed
  $scope.$on('$destroy', function () {
    $interval.cancel(poll);
  });

  // query system events
  System.events()
    .then(function (events) {
      vm.events = events;
    });


  // FAKE GRAPH STUFF
  // TODO - remove this stuff

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

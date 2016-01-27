angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  '$translate', 'appstate', 'exchange', 'SessionService'
];

function HomeController($translate, appstate, exchange, SessionService) {
  var vm = this;

  vm.today = new Date();
  vm.project = SessionService.project;
  vm.user = SessionService.user;
  vm.enterprise = SessionService.enterprise;

  // listen for changes in exchange rate and update accordingly
  appstate.register('exchange_rate', loadDailyExchangeRate);

  // FIXME
  // This doesn't account for multiple currencies
  function loadDailyExchangeRate() {
    vm.hasDailyRate = exchange.hasDailyRate();

    vm.exchangeRate = vm.hasDailyRate ?
        '1 $ = ' + exchange.rate(100, 1, vm.today) + ' Fc' :
        $translate.instant('HOME.UNDEFINED');
  }

  loadDailyExchangeRate();
}

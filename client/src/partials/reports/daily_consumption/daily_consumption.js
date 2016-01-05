angular.module('bhima.controllers')
.controller('ReportDailyConsumptionController', ReportDailyConsumptionController);

ReportDailyConsumptionController.$inject = ['$http', '$window', 'DateService'];

function ReportDailyConsumptionController($http, $window, Dates) {
  var vm = this,
      state = vm.state;

  // TODO -- these should be passed in as URL parameters and default to today
  vm.start = new Date();
  vm.end = new Date();
  vm.state = 'default';
  vm.loading = false;

  // bind view methods
  vm.generate = generate;
  vm.reconfigure = reconfigure;
  vm.print = function () { $window.print(); };
  vm.focus = focusIn;
  vm.unfocus = unfocus;

  /* ------------------------------------------------------------------------ */

  function generate() {
    vm.loading = true;

    $http.get('/inventory/consumption', {
      params : {
        'detailed' : 1,
        'start' : Dates.util.str(vm.start),
        'end' : Dates.util.str(vm.end)
      }
    })
    .then(function (response) {

      // filter out drugs that do not have consumptions
      var consumptions = response.data.filter(function (item) {
        return item.consumption.length > 0;
      });

      // sum up the number of consumptions
      consumptions.forEach(function (item) {
        item.total = item.consumption.reduce(function (a, b) {
          return a + b.quantity;
        }, 0);
      });

      vm.consumptions = consumptions;

      // TODO -- better state names
      vm.state = 'generate';
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      vm.loading = false;
    });
  }

  function reconfigure() {
    vm.state = 'default';
  }

  // focus on an item
  function focusIn(item) {
    vm.detailed = item;
  }

  function unfocus() {
    vm.detailed = null;
  }
}

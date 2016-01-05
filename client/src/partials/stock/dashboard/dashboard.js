angular.module('bhima.controllers')
.controller('StockDashboardController', StockDashboardController);

StockDashboardController.$inject = [
  '$q', '$http', 'StockDataService', 'DateService'
];

function StockDashboardController($q, $http, DataService, Dates) {
  var vm = this;

  // bind view values
  vm.purchaseorders = {};
  vm.limits = { consumption : 10, donations : 10 };

  // loading indicators
  vm.indicators = {
    consumption : false,
    donations : false
  };

  // startup the module
  startup();

  /* ----------------------------------------------------------------------- */

  function startup() {
    loadPurchaseDetails();
    loadConsumptionDetails();
    loadDonations();
    loadExpirationDetails();
    loadStockStatus();
  }

  // get the top most consumed items
  function loadConsumptionDetails() {

    // start loading indicator
    vm.indicators.consumption = true;

    DataService.getConsumption()
    .then(function (response) {
      var items = response.data;

      // loop through each item and sum up the consumption quantity
      items.forEach(function (i) {

        // sum up the consumption events
        i.consumed = i.consumption.reduce(function (a, b) {
          return a + b.quantity;
        }, 0);
      });

      // sort the inventory items by greated consumption
      items.sort(function (a, b) {
        return a.consumed < b.consumed ? 1 : -1;
      });

      vm.consumption = items;
    })
    .finally(function () { vm.indicators.consumption = false; });
  }

  // load stock alerts
  function loadStockStatus() {
    DataService.getStockStatus()
    .then(function (response) {

      vm.statuses = response.data;

      // stock alerts to be displayed
      var alerts = {
        overstock : 0,
        shortage  : 0,
        stockout  : 0,
        optimal   : 0,
        expired   : 0
      };

      // loop through each inventory item and categorize alerts
      vm.alerts = vm.statuses.reduce(function (agg, value) {
        if (value.overstock) { agg.overstock += 1; }
        if (value.shortage) { agg.shortage += 1; }
        if (value.stockout) { agg.stockout += 1; }
        if (value.expired) { agg.expired += 1; }

        // we need to make sure someone didn't forget to set stock_max
        if (value.stock_max === value.quantity && value.quantity !== 0) {
          agg.optimal += 1;
        }
        return agg;
      }, alerts);
    });
  }

  /* Loads the most recent donations into the dashboard */
  function loadDonations() {

    // start the donations loading indicator
    vm.indicators.donations = true;

    // TODO -- make this number configurable
    DataService.getDonations(vm.limits.donations)
    .then(function (response) {
      vm.donations = response.data;
    })
    .finally(function () { vm.indicators.donations = false; });
  }

  // TODO - this belongs in a PurchaseOrders Service
  //
  // Load information about purchases orders based on their statuses.
  // We are getting orders that
  //  1) have not been approved
  //  2) have been paid but not fulfilled
  //  3) are in transit
  //  4) have been paid and delivered
  function loadPurchaseDetails() {
    var target = '/purchaseorders?status=',
        statuses;

    statuses = [
      'pending',
      'paid',
      'shipped',
      'delivered'
    ];

    $q.all(statuses.map(function (status) {
      return $http.get(target + status);
    }))
    .then(function (array) {
      vm.purchaseorders.pending   = array[0].data[0].count;
      vm.purchaseorders.paid      = array[1].data[0].count;
      vm.purchaseorders.shipped   = array[2].data[0].count;
      vm.purchaseorders.delivered = array[3].data[0].count;
    });
  }


  // load expirations over different time frames
  function loadExpirationDetails() {

    // start and end dates for each period
    vm.expirations =  [{
      id : '0',
      key : 'STOCK.EXPIRATIONS.TODAY',
      range : [
        '00-00-0000', // this is supposed to be as far back as we can go!
        Dates.util.str(Dates.current.day()),
      ]
    }, {
      id : '0-30',
      key : 'STOCK.EXPIRATIONS.30_DAYS',
      range : [
        Dates.util.str(Dates.current.day()),
        Dates.util.str(Dates.next.nDay(30))
      ]
    }, {
      id: '30-60',
      key : 'STOCK.EXPIRATIONS.30_TO_60_DAYS',
      range : [
        Dates.util.str(Dates.next.nDay(30)),
        Dates.util.str(Dates.next.nDay(60))
      ]
    }, {
      id :'60-90',
      key : 'STOCK.EXPIRATIONS.60_TO_90_DAYS',
      range : [
        Dates.util.str(Dates.next.nDay(60)),
        Dates.util.str(Dates.next.nDay(90))
      ]
    }, {
      id : '90-120',
      key : 'STOCK.EXPIRATIONS.90_TO_120_DAYS',
      range : [
        Dates.util.str(Dates.next.nDay(90)),
        Dates.util.str(Dates.next.nDay(120))
      ]
    }, {
      id : '120-180',
      key : 'STOCK.EXPIRATIONS.120_TO_180_DAYS',
      range : [
        Dates.util.str(Dates.next.nDay(120)),
        Dates.util.str(Dates.next.nDay(180))
      ]
    }, {
      id :'180-360',
      key : 'STOCK.EXPIRATIONS.180_TO_360_DAYS',
      range : [
        Dates.util.str(Dates.next.nDay(180)),
        Dates.util.str(Dates.next.nDay(360))
      ]
    }];

    $q.all(vm.expirations.map(function (v) {
      return DataService.getStockExpirations(v.range[0], v.range[1]);
    }))
    .then(function (results) {
      // loop through expirations, counting the number of expiring items in
      // the resultant arrays and attaching them as a count
      results.forEach(function (ex, idx) {
        vm.expirations[idx].count = ex.data.length;
      });
    });
  }
}

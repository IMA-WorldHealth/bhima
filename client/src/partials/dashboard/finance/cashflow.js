angular.module('bhima.controllers')

// Cash Box Chart Controllers
//
// The framework for how to do dashboards is still a work in progress.
// The code below is poorly written, as I am still prototyping how to
// all the different pieces together.  It should be rewritten as soon
// as we understand what each chart/controller will do.
.controller('CashFlowChartController', [
    '$scope',
    '$filter',
    '$translate',
    'appcache',
    'FinanceDashboardService',
    'ChartService',
    function ($scope, $filter, $translate, AppCache, Finance, ChartService) {

    // alias this
    var self = this,
        cache = new AppCache('CashFlowChart'),
        $date = $filter('date');

    // expose group options to the view
    self.grouping = ChartService.grouping;

    // defaults
    self.currencyId = 1;
    self.hasPostingJournal = 1;
    self.group = self.grouping[0];

    // TODO
    // This should be chosen, and format the axes labels appropriately
    self.cashBoxGrouping = 'month';

    // records the data for the chart
    self.chart = {
      options : { multiTooltipTemplate: ChartService.multitooltip.currency },
      colors : ['#468847', '#F7464A'],
      series : ['Income', 'Expense']
    };

    // retrieve the list of cashboxes from the server
    self.getCashBoxes = function () {
      return Finance.getCashBoxes();
    };

    // load the balance data for a single account
    self.getCashBalance = function (cashBoxId) {
      Finance.getCashBoxBalance(cashBoxId, self.currencyId, self.hasPostingJournal)
      .then(function (response) {

        // this is the immediate overview (income, expense, balance)
        self.meta = response.data[0];
      });
    };

    // load the analytics history of the given cashbox
    self.getCashHistory = function (cashBoxId) {
      Finance.getCashBoxHistory(cashBoxId, self.currencyId, self.hasPostingJournal, self.group.grouping)
      .then(function (response) {
        var data = response.data;

        // assign chart data
        self.chart.data = [
          data.map(function (row) { return row.debit; }),
          data.map(function (row) { return row.credit; }),
        ];

        // assign the chart labels
        self.chart.labels = data.map(function (row) { return $date(row.trans_date, self.group.format); });
      });
    };

    // in initialize the module
    self.getCashBoxes()
    .then(function (response) {
      self.cashBoxes = response.data;
      return Finance.getCurrencies();
    })
    .then(function (response) {
      self.currencies = response.data;
      return loadChartDefaults();
    })
    .then(function () {

      // make sure we have a cash box id defined
      if (!self.cashBoxId) {
        self.cashBoxId = self.cashBoxes[0].id;
      }

      // load module data
      self.getCashBalance(self.cashBoxId);
      self.getCashHistory(self.cashBoxId);
    });

    // load defaults from localstorage
    function loadChartDefaults() {
      return cache.fetch('options')
      .then(function (options) {
        if (options) {
          self.currencyId        = options.currencyId;
          self.hasPostingJournal = options.hasPostingJournal;
          self.cashBoxId         = options.cashBoxId;
          var group = self.grouping[options.groupIdx];
          if (group) { self.group = self.grouping[options.groupIdx]; }
        }
      });
    }

    // save defaults to localstorage
    function saveChartDefaults() {

      // TODO
      // this could probably be done much better.
      var idx = self.grouping.reduce(function (idx, group, index) {
        if (idx !== -1) { return idx; }
        return group.key === self.group.key ? index : -1;
      }, -1);

      cache.put('options', {
        currencyId        : self.currencyId,
        hasPostingJournal : self.hasPostingJournal,
        cashBoxId         : self.cashBoxId,
        groupIdx          : idx
      });
    }

    // refreshes the chart
    self.refresh = function () {

      // first, save the metadata
      saveChartDefaults();

      // load module data
      self.getCashBalance(self.cashBoxId);
      self.getCashHistory(self.cashBoxId);
    };

    self.fmt = function (key) {
      return $translate.instant(key);
    };
  }
]);

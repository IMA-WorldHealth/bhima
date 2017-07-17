angular.module('bhima.controllers')
  .controller('ChartCashDashboardController', ChartCashDashboardController);

ChartCashDashboardController.$inject = [
  '$translate', '$filter', '$scope', 'SessionService',
  'DashboardChartService',
];
/**
 * ChartCashDashboardController
 */
function ChartCashDashboardController($translate, $filter, $scope, Session,
  Dashboard) {
  var vm = this;

  vm.summary = { total : 0, reversed : 0 };
  vm.enterprise = Session.enterprise;

  // chart variables
  vm.groupChart = null;
  vm.hourChart = null;
  vm.dayChart = null;
  vm.monthChart = null;

  $scope.$on('data-received', function (event, data) {
    generateHourChart(data);
    generateDayChart(data);
    generateMonthChart(data);
    paymentSummary(data);
    generateGroupChart(data);
  });

  /**
   * Generate Hour Chart
   * @param {object} data
   */
  function generateHourChart(data) {
    var payments = Dashboard.computeDataset(data.countHour, 'count', 'hour');
    var reversedPayments = Dashboard.computeDataset(data.reversedHour, 'count', 'hour');
    var dataset = formatPaymentDataset('hour', payments, reversedPayments);
    var ctx = document.getElementById('hourChart').getContext('2d');

    // clear canvas for previous chart rendering
    if (vm.hourChart) { vm.hourChart.destroy(); }

    vm.hourChart = new Chart(ctx, {
      type : 'bar',
      options : chartOptions($translate.instant('DASHBOARD.CASH.CHART_HOUR')),
      data : {
        labels : dataset.payments.labels,
        datasets : [
          {
            label : $translate.instant('DASHBOARD.CASH.PAYMENT'),
            data : dataset.payments.data,
            backgroundColor : 'rgba(54, 162, 235, 0.2)',
            borderColor : 'rgba(54, 162, 235, 1)',
            borderWidth : 1,
          },

          {
            label : $translate.instant('DASHBOARD.CASH.REVERSED'),
            data : dataset.reversedPayments.data,
            backgroundColor : 'rgba(255, 99, 132, 0.2)',
            borderColor : 'rgba(255,99,132,1)',
            borderWidth : 1,
          },
        ],
      },
    });
  }

  /**
   * Generate Dayofweek Chart
   * @param {object} data
   */
  function generateDayChart(data) {
    var payments = Dashboard.computeDataset(data.countDay, 'count', 'dayofweek');
    var reversedPayments = Dashboard.computeDataset(data.reversedDay, 'count', 'dayofweek');
    var dataset = formatPaymentDataset('dayofweek', payments, reversedPayments);
    var ctx = document.getElementById('dayChart').getContext('2d');

    // clear canvas for previous chart rendering
    if (vm.dayChart) { vm.dayChart.destroy(); }

    vm.dayChart = new Chart(ctx, {
      type : 'bar',
      options : chartOptions($translate.instant('DASHBOARD.CASH.CHART_DAY')),
      data : {
        labels : Dashboard.getDayLabels(dataset.payments.labels),
        datasets : [
          {
            label : $translate.instant('DASHBOARD.CASH.PAYMENT'),
            data : dataset.payments.data,
            backgroundColor : 'rgba(54, 162, 235, 0.2)',
            borderColor : 'rgba(54, 162, 235, 1)',
            borderWidth : 1,
          },

          {
            label : $translate.instant('DASHBOARD.CASH.REVERSED'),
            data : dataset.reversedPayments.data,
            backgroundColor : 'rgba(255, 99, 132, 0.2)',
            borderColor : 'rgba(255,99,132,1)',
            borderWidth : 1,
          },
        ],
      },
    });
  }

  /**
   * Generate Month Chart
   * @param {object} data
   */
  function generateMonthChart(data) {
    var payments = Dashboard.computeDataset(data.countMonth, 'count', 'month');
    var reversedPayments = Dashboard.computeDataset(data.reversedMonth, 'count', 'month');
    var dataset = formatPaymentDataset('month', payments, reversedPayments);
    var ctx = document.getElementById('monthChart').getContext('2d');

    // clear canvas for previous chart rendering
    if (vm.monthChart) { vm.monthChart.destroy(); }

    vm.monthChart = new Chart(ctx, {
      type : 'bar',
      options : chartOptions($translate.instant('DASHBOARD.CASH.CHART_MONTH')),
      data : {
        labels : Dashboard.getMonthLabels(dataset.payments.labels),
        datasets : [
          {
            label : $translate.instant('DASHBOARD.CASH.PAYMENT'),
            data : dataset.payments.data,
            backgroundColor : 'rgba(54, 162, 235, 0.2)',
            borderColor : 'rgba(54, 162, 235, 1)',
            borderWidth : 1,
          },

          {
            label : $translate.instant('DASHBOARD.CASH.REVERSED'),
            data : dataset.reversedPayments.data,
            backgroundColor : 'rgba(255, 99, 132, 0.2)',
            borderColor : 'rgba(255,99,132,1)',
            borderWidth : 1,
          },
        ],
      },
    });
  }

  /**
   * Generate Group chart
   * @param {object} data
   */
  function generateGroupChart(data) {
    var dataset = Dashboard.computeDataset(data.group, 'count', 'name');
    var ctx = document.getElementById('groupChart').getContext('2d');

    // clear canvas for previous chart rendering
    if (vm.groupChart) { vm.groupChart.destroy(); }

    vm.groupChart = new Chart(ctx, {
      type : 'pie',
      options : chartOptions($translate.instant('DASHBOARD.CASH.DEBTOR_GROUP')),
      data : {
        labels : dataset.labels,
        datasets : [
          {
            label : $translate.instant('DASHBOARD.CASH.PAYMENT'),
            data : dataset.data,
            backgroundColor : [
              '#60c6e0', '#0b97b5', '#287181', '#22c36a', '#207647',
              '#db9b2b', '#634614', '#e91945', '#be1cb4', '#e3e934',
            ],
          },
        ],
      },
    });
  }

  /** chart options */
  function chartOptions(text, params) {
    params = params || {};
    var options = {
      title : {
        display : true,
        text : text,
        fontSize : 20,
      },
      legend : {
        display : true,
      },
    };
    angular.extend(options, params);
    return options;
  }

  /**
   * @method paymentSummary
   * @description process useful payment data as summary
   * @param {object} dataset
   */
  function paymentSummary(dataset) {
    vm.summary.total = Dashboard.computeDatasetTotals(dataset.countDay, 'count');
    vm.summary.reversed = Dashboard.computeDatasetTotals(dataset.reversedDay, 'count');
    vm.summary.value = Dashboard.computeDatasetTotals(dataset.value, 'value');
  }

  /**
   * formatDataset
   * format the dataset for charting
   */
  function formatPaymentDataset(range, paymentDataset, reversedPaymentDataset) {
    var labels = Dashboard.computeLabels(range, paymentDataset.labels, reversedPaymentDataset.labels);
    return {
      payments : Dashboard.fillDataset(labels, paymentDataset),
      reversedPayments : Dashboard.fillDataset(labels, reversedPaymentDataset),
    };
  }
}

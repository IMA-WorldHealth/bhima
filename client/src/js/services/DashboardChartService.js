angular.module('bhima.services')
  .service('DashboardChartService', DashboardChartService);

// DI
DashboardChartService.$inject = [
  '$translate', '$filter',
];

function DashboardChartService($translate, $filter) {
  var service = this;

  // constants
  var HOURS =
    [
      '01H', '02H', '03H', '04H', '05H', '06H', '07H', '08H', '09H', '10H', '11H', '12H',
      '13H', '14H', '15H', '16H', '17H', '18H', '19H', '20H', '21H', '22H', '23H', '24H',
    ];
  var DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 7];
  var MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // axes ranges
  var axeRange = {
    hour : HOURS,
    dayofweek : DAYS_OF_WEEK,
    month : MONTHS,
  };

  // time display
  var displayDayofweek = {
    1 : 'DASHBOARD.DAYS.SUNDAY',
    2 : 'DASHBOARD.DAYS.MONDAY',
    3 : 'DASHBOARD.DAYS.TUESDAY',
    4 : 'DASHBOARD.DAYS.WEDNESDAY',
    5 : 'DASHBOARD.DAYS.THURSDAY',
    6 : 'DASHBOARD.DAYS.FRIDAY',
    7 : 'DASHBOARD.DAYS.SATURDAY',
  };

  var displayMonth = {
    1 : 'DASHBOARD.MONTHS.JANUARY',
    2 : 'DASHBOARD.MONTHS.FEBRUARY',
    3 : 'DASHBOARD.MONTHS.MARCH',
    4 : 'DASHBOARD.MONTHS.APRIL',
    5 : 'DASHBOARD.MONTHS.MAY',
    6 : 'DASHBOARD.MONTHS.JUNE',
    7 : 'DASHBOARD.MONTHS.JULY',
    8 : 'DASHBOARD.MONTHS.AUGUST',
    9 : 'DASHBOARD.MONTHS.SEPTEMBER',
    10 : 'DASHBOARD.MONTHS.OCTOBER',
    11 : 'DASHBOARD.MONTHS.NOVEMBER',
    12 : 'DASHBOARD.MONTHS.DECEMBER',
  };

  // expose
  service.axeRange = axeRange;

  // bind methods
  service.computeLabels = computeLabels;
  service.computeDataset = computeDataset;
  service.computeDatasetTotals = computeDatasetTotals;
  service.getUniqueValues = getUniqueValues;
  service.sortArray = sortArray;
  service.sortNumberArray = sortNumberArray;
  service.fillDataset = fillDataset;
  service.getMonthLabels = getMonthLabels;
  service.getDayLabels = getDayLabels;

  /**
   * sortNumber
   */
  function sortNumber(a, b) {
    return a - b;
  }

  /**
   * sortArray
   * @param {array} array - a given array
   */
  function sortArray(array) {
    if (!array.length) { return array; }
    return typeof array[0] === 'number' ? array.sort(sortNumber) : array.sort();
  }

  /**
   * sortNumberArray
   * @param {array} array - a given array
   */
  function sortNumberArray(array) {
    return array.sort(sortNumber);
  }

  /**
   * getUniqueValues
   * @param {array} array - a given array
   */
  function getUniqueValues(array) {
    return array.filter(function (element, index, arr) {
      return arr.indexOf(element) === index;
    });
  }

  /**
   * computeLabels
   * returns labels for chart axes by mergin given labels to a base labels
   * and produce an array of unique label and sorted
   * @param {string} range - (hour, dayofweek, month, ...)
   * @param {array} labels - array of label
   * @param {array} secondarylabels - array of label (in case of multi chart)
   */
  function computeLabels(range, labels, secondarylabels) {
    var base = axeRange[range] || [];
    var givenLabels = base.concat(labels, secondarylabels);
    var uniqueLabels = getUniqueValues(givenLabels);
    var sortedLabels = sortArray(uniqueLabels);
    return sortedLabels;
  }

  /**
   * computeDataset
   * returns dataset for chart
   * @param {array} dataset - a given array
   * @param {string} valueLabel - (Ex. "SELECT COUNT(*) AS valueLabel")
   * @param {string} groupingLabel - (Ex. "SELECT HOUR(date) AS groupingLabel ... FROM ... GROUP BY HOUR(date)")
   * @return {object} out - { data: [], labels: [] }
   */
  function computeDataset(dataset, valueLabel, groupingLabel) {
    var out = { labels : [], data : [] };
    if (!dataset.length) { return out; }

    dataset.forEach(function (item) {
      out.labels.push(item[groupingLabel]);
      out.data.push(item[valueLabel]);
    });

    return out;
  }

  /**
   * computeDatasetTotals
   * @param {array} dataset - a given array
   * @param {string} lable
   */
  function computeDatasetTotals(dataset, label) {
    return dataset.reduce(function (aggregate, value) {
      return label ? aggregate + value[label] : aggregate + value.count;
    }, 0);
  }

  /**
   * fillDataset
   * @description
   * returns a dataset with data elements well positioned
   * according the base array
   *
   * @param {array} base - An array of labels as base
   * @param {array} dataset - { data: [], labels: [] }
   */
  function fillDataset(base, dataset) {
    if (base.length < dataset.labels.length) { return dataset; }

    var newDataset = { data : [], labels : [] };

    for (var i = 0; i < base.length; i++) {
      newDataset.data[i] = 0;
      newDataset.labels[i] = base[i];
      for (var j = 0; j < dataset.labels.length; j++) {
        if (base[i] === dataset.labels[j]) {
          newDataset.data[i] = dataset.data[j];
        }
      }
    }
    return newDataset;
  }

  /**
   * get months as label
   * @param {object} labels - an array of labels
   */
  function getMonthLabels(labels) {
    return labels.map(function (label) {
      return $translate.instant(displayMonth[label]);
    });
  }

  /**
   * get months as label
   * @param {object} labels - an array of labels
   */
  function getDayLabels(labels) {
    return labels.map(function (label) {
      return $translate.instant(displayDayofweek[label]);
    });
  }
}


angular.module('bhima.services')

// Chart Service
//
// This service tries to make working with ChartJs easier by
// prepackaging lots of options that we use repeatedly.
.service('ChartService', ['$filter', function ($filter) {
  var service = {},
      $date = $filter('date'),
      $currency = $filter('currency');

  // chart grouping options
  // key is for translation
  // grouping is for query generation
  // format is for $date format
  service.grouping = [
    { key : 'CHART.GROUPING.DAY'   , grouping: 'day'   , format : 'dd-MM-yyyy' },
    { key : 'CHART.GROUPING.WEEK'  , grouping: 'week'  , format : 'EEEE' },
    { key : 'CHART.GROUPING.MONTH' , grouping: 'month' , format : 'MMMM' },
    { key : 'CHART.GROUPING.YEAR'  , grouping: 'year'  , format : 'yyyy' }
  ];

  service.multitooltip = {
    // Interesting that this works...
    currency : '<%= datasetLabel %> : <%= value.toLocaleString("en", { style: "currency", currency: "USD" })  %>'
  };

  return service;
}]);

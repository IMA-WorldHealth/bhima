angular.module('bhima.controllers')

// composes query strings nicely off a url and
// an object of potential queries.
// queries = { hasId : 0, utm_awesome: undefined } => '?hasId=1'
.service('QueryService', function () {
  var service = {};

  service.compose = function (url, queries) {
    var value, params = [];

    // append the querystring to the url
    url += '?';

    // loop through the queries, and if they are defined,
    // append them to the params object
    // NOTE - values can be arrays, strings, or numbers
    Object.keys(queries).forEach(function (key) {
      value = queries[key];
      if (angular.isDefined(value)) {
        params.push(key + '=' + value.toString());
      }
    });

    url += params.join('&');

    return url;
  };

  return service;
})


// Finance DashBoard Service
// Performs the HTTP queries for the financial dashboard controller
.service('FinanceDashboardService', ['$http', '$translate', 'QueryService', function ($http, $translate, QS) {

  var service = {};

  // get a list of cashboxes and associated currencies/accounts
  service.getCashBoxes = function () {
    return $http.get('/analytics/cashboxes');
  };

  // retrieve a list of valid currencies
  service.getCurrencies = function () {
    return $http.get('/currencies');
  };

  service.getCashBoxBalance = function (boxId, currencyId, hasPostingJournal) {
    var stub = '/analytics/cashboxes/' + boxId + '/balance',
        url = QS.compose(stub, { currencyId : currencyId, hasPostingJournal : hasPostingJournal  });

    return $http.get(url);
  };

  service.getCashBoxHistory = function (boxId, currencyId, hasPostingJournal, grouping) {
    var stub = '/analytics/cashboxes/' + boxId + '/history',
        url = QS.compose(stub, {
          currencyId : currencyId,
          hasPostingJournal : hasPostingJournal,
          grouping : grouping
        });

    return $http.get(url);
  };

  // get the debtor groups owing the most money
  service.getTopDebtorGroups = function (limit) {
    return $http.get('/analytics/debtorgroups/top?limit=' + limit);
  };

  // get the debtors owing the most money
  service.getTopDebtors = function (limit) {
    return $http.get('/analytics/debtors/top?limit=' + limit);
  };

  var all = $translate.instant('UTIL.ALL');

  // limits for things
  service.limits = {
    10  : 10,
    25  : 25,
    50  : 50,
    all : Infinity
  };

  return service;
}]);

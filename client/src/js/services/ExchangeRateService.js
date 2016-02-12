angular.module('bhima.services')
.service('ExchangeRateService', ExchangeRateService);

ExchangeRateService.$inject = [
  '$http', '$q', 'util', 'CurrencyService', 'SessionService'
];

/**
* Exchange Rate Service
*
* This goal of this service is to eventually replace the old `exchange` service,
* which has a confusing API and is difficult to test, highly coupled to appstate,
* and suffers from poorly written code.
*
* IMPORTANT:
* The application no longer assumes that you need to have an exchange rate set
* daily.  Instead, the previous valid rate will be used.  At startup, we check
* first that we have defined at least one rate for every currency supported by
* the application and throw a MISSING_EXCHANGE_RATES error if we are missing a base
* rate for any of the currencies.
*
* @todo - How should we best handle errors such as looking up old dates before an
* exchange rate is defined?  What happens when we call
* service.convertToEnterpriseCurrency(someId, null, 100)?
*
* @todo - documentation improvements
*/
function ExchangeRateService($http, $q, util, Currencies, Session) {
  var service = {};
  var cache;

  // The cMap object contains rates namespaced by their currency IDs for faster
  // lookups when doing conversions.
  var cMap = {};

  service.read = read;
  service.create = create;
  service.convertToEnterpriseCurrency = convertToEnterpriseCurrency;
  service.convertFromEnterpriseCurrency = convertFromEnterpriseCurrency;
  service.update = update;
  service.getCurrentRate = getCurrentRate;
  service.getExchangeRate = getExchangeRate;
  service.hasDailyRate = hasDailyRate; 
  service.delete = del;


  /* ------------------------------------------------------------------------ */

  function read() {
    var rates;

    // if we have local cached rates, return them immediately
    //if (cache) { return $q.resolve(cache); }

    // query the exchange_rate table on the backend
    return $http.get('/exchange')
      .then(util.unwrapHttpResponse)
      .then(function (data) {

        // if there is no data, the controllers should be alerted
        // by throwing an missing exchange rate error.
        if (data.length === 0) {
          throw 'EXCHANGE.MISSING_EXCHANGE_RATES';
        }

        // share rates on promise chain, converting dates to date objects
        rates = data.map(function (row) {
          row.date = new Date(row.date);
          return row;
        });

        // make sure we have a rate per currency by looping through the
        // currencies and verifying that each currency (besides the
        // enterprise currency) has an exchange rate
        return Currencies.read();
      })
      .then(function (currencies) {

        // filter out the enteprise currency
        currencies = currencies.filter(function (currency) {
          return currency.id !== Session.enterprise.currency_id;
        });

        // check if we have a rate for every currency defined
        var complete = currencies.every(function (currency) {
          return rates.some(function (rate) {
            return rate.currency_id === currency.id;
          });
        });

        // you must have at least one rate for each currency defined
        // if that doesn't exist, throw an error
        if (!complete) {
          throw 'EXCHANGE.MISSING_EXCHANGE_RATES';
        }

        // store the exchange rates for the fast future lookup.
        cache = rates;
        cMap = buildCMap(rates);

        // return the rates if all checks passed
        return rates;
      });
  }

  function create(data) {
    return $http.post('/exchange', { rate : data })
      .then(util.unwrapHttpResponse)
      .then(function (data) {

        // force refresh on successful data loading by busting the cached data
        cache = undefined;
        read();

        return data;
      });
  }

  function update(id, rate) {
    return $http.put('/exchange/' + id, rate)
    .then(util.unwrapHttpResponse);
  }

  // build the cMap object from an array of rates
  function buildCMap(rates) {

    // initially sort the rates by date for fast lookups later (we can just take the last rate)!
    rates.sort(function (a,b) {
      return (a.date > b.date) ? 1 : (a.date === b.date ? 0 : -1);
    });

    // turn a flat array into an object of currencyId mapped to all relevant rates
    return rates.reduce(function (map, row) {

      // make an array for the currencyId if it doesn't already exist
      if (!map[row.currency_id]) { map[row.currency_id] = []; }

      // add the rate to the list of currency ids
      map[row.currency_id].push({ date : row.date, rate : row.rate });

      return map;
    }, {});
  }

  // converts an {amount} of money from {currencyId} to the enterprise currency
  // using the exchange rate valid for the date {date}
  function convertToEnterpriseCurrency(currencyId, date, amount) {

    // get the current exchange rate
    var rate = getExchangeRate(currencyId, date);

    return amount * (1 / rate);
  }

  // converts an {amount} of money to {currencyId} from the enterprise currency
  // using the exchange rate valid for the date {date}
  function convertFromEnterpriseCurrency(currencyId, date, amount) {

    // get the current exchange rate
    var rate = getExchangeRate(currencyId, date);

    return amount * rate;
  }

  // get the current exchagne rate for a currency
  function getCurrentRate(currencyId) {
    return getExchangeRate(currencyId, new Date());
  }

  // get the rate for a currency on a given date
  function getExchangeRate(currencyId, date) {

    // parse date into a date object (if not already a date)
    date = new Date(Date.parse(date));

    // if we passed in the enterprise currency, just return the amount.  Allows
    // you to apply this transformation to a list of mixed currencies.
    if (currencyId === Session.enterprise.currency_id) { return 1; }

    // look up the rates for currencyId via the cMap object.
    var rates = cMap[currencyId].filter(function (row) {
      return row.date <= date;
    });

    // get the last rate for the given currency
    var rate = rates[rates.length - 1].rate;

    return rate;
  }

  function hasDailyRate(currencyId, date) {

    // parse date into a date object (if not already a date)
    date = new Date(Date.parse(date));

    // if we passed in the enterprise currency, just return the amount.  Allows
    // you to apply this transformation to a list of mixed currencies.
    if (currencyId === Session.enterprise.currency_id) { return 1; }

    // look up the rates for currencyId via the cMap object.
    var rates = cMap[currencyId].filter(function (row) {
 
      var dayDate = date.getDate();
      var monthDate = date.getMonth();
      var yearDate = date.getFullYear();

      var dayRowDate = row.date.getDate();
      var monthRowDate = row.date.getMonth();
      var yearRowDate = row.date.getFullYear(); 

      return ((dayDate === dayRowDate) && (monthDate === monthRowDate) && (yearDate === yearRowDate));
    });

    if(rates[0]){
      return true;
    } else {
      return false;
    }
  }

  function del(id) {
    return $http.delete('/exchange/' + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}

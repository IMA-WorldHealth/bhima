angular.module('bhima.filters')
.filter('exchange', ExchangeFilter);

ExchangeFilter.$inject = ['appstate', 'precision' ];

/**
 * Exchange Filter
 *
 * @deprecated This functionality should be explicitly performed in a service or
 * controller using the ExchangeRateService.  This service is too generic.
 */
function ExchangeFilter(appstate, precision) {
  var map;


  appstate.register('exchange_rate', function (globalRates) {

    // build rate map anytime the exchange rate changes.
    globalRates.forEach(function (r) {
      map[r.currency_id] = r.rate;
    });
  });

  return function exchange(value, currency_id) {

    // throw a deprecation warning
    console.warning('[DEPRECATED] The exchange rate filter is deprecated. Please use the ExchangeRateService instead.');

    value = value || 0;
    var scalar = map[currency_id] || 1;
    return map ? precision.round(scalar*value, 2) : precision.round(value, 2);
  };
}

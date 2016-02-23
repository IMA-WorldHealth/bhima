angular.module('bhima.services')
.service('exchange', [
  '$timeout',
  '$translate',
  'store',
  'appstate',
  'messenger',
  'precision',
  'connect',
  function ($timeout, $translate, Store, appstate, messenger, precision, connect) {
    // FIXME : this module needs to be able to do
    // exchange.setRate() so that it can detect changes
    var called = false;
    var cfg = {};

    var DateStore = new Store({ identifier : 'date', data : [] });

    function normalize (date) {
      return date.setHours(0,0,0,0);
    }

    function exchange (value, currency_id, date) {
      // This function exchanges data from the currency specified by currency_id to
      // the enterprise currency on a given date (default: today).
      date = date || new Date();
      date = normalize(new Date(date));

      var store = DateStore.get(date);
      if (!store && !called) { // HACK to only show one messenger instance
        messenger.danger($translate.instant('EXCHANGE.NO_EXCHANGE_RATE') + new Date(date));
        called = true;
        $timeout(function () { called = false; }, 50);
      }

      return precision.round(store && store.rates.get(currency_id) ? store.rates.get(currency_id).rate * value : value);
    }

    exchange.rate = function rate (value, currency_id, date) {
      /* jshint unused : false */
      date = normalize(new Date(date || new Date()));

      var store = DateStore.get(date);
      if (!store) { messenger.danger($translate.instant('EXCHANGE.NO_EXCHANGE_RATE') + new Date(date)); }
      return precision.round(store && store.rates.get(currency_id) ? store.rates.get(currency_id).rate : 1);
    };

    exchange.hasDailyRate = function hasDailyRate (dateParam) {

      var date = normalize(new Date(dateParam)) || normalize(new Date());
      return !!DateStore.get(date);
    };

    exchange.convertir = function convertir (value, from_currency_id, to_currency_id, date) {
      date = new Date(date) || new Date();
      date = normalize(date);
      var converter = DateStore.get(date);
      if (!converter) { messenger.danger($translate.instant('EXCHANGE.NO_EXCHANGE_RATE') + new Date(date)); return;}

      var from = converter.rates.data.filter(function (item) {
        return item.id === from_currency_id;
      })[0];

      var to = converter.rates.data.filter(function (item) {
        return item.id === to_currency_id;
      })[0];

      return (value * to.rate) / from.rate;
    };

    function createDailyRateStore(rate) {
      var date = normalize(new Date(rate.date));
      var store = DateStore.get(date);

      if (!store) {
        DateStore.post({ date : date, rates : new Store({ data : [] }) });
        store = DateStore.get(date);
      }

      store.rates.post({
        id : rate.currency_id,
        rate : rate.rate,
      });

      store.rates.post({
        id : rate.enterprise_currency_id,
        rate: 1
      });
    }

    function loadRates(rates) {
      // loads in an array of rates

      rates.forEach(function (rate) {
        createDailyRateStore(rate);
      });
    }

    function forceRefresh() {
      loadRates(appstate.get('exchange_rate'));
    }

    exchange.forceRefresh = forceRefresh;

    appstate.register('exchange_rate', loadRates);

    return exchange;
  }
]);

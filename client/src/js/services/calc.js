angular.module('bhima.services')
.service('calc', [
  'precision',
  'appstate',
  'store',
  function (precision, appstate, Store) {
    // this service calculates the nearest rounded price
    // to pay or bill, based on the currency
    var store;

    appstate.register('currencies', function (curr) {
      store = new Store({ data : curr});
    });

    return function calcPrice(price, currency_id) {
      var unit, r, round, total, diff;

      if (!store) { throw new Error('No currencies defined!'); }

      unit = store.get(currency_id).min_monentary_unit;
      r = price % unit;
      round = unit - r;
      total = precision.round(r > unit / 2 ? price + round : price - r, 0);
      diff = precision.round(unit - r);

      return { total : total, difference : diff };
    };
  }
]);

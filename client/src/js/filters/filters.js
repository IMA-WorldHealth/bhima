'use strict';

angular.module('bhima.filters')
  .filter('boolean', function() {
    return function (input) {
      return Boolean(Number(input));
    };
  })
  .filter('unique', function () {
    return function (items, filterOn) {
      console.log('item est : ', items, 'filteron est ', filterOn);

      if (filterOn === false) {
        return items;
      }

      if ((filterOn || angular.angular.isUndefined(filterOn)) && angular.isArray(items)) {
        var newItems = [];

        var extractValueToCompare = function (item) {
          if (angular.angular.isObject(item) && angular.isString(filterOn)) {
            return item[filterOn];
          } else {
            return item;
          }
        };

        angular.forEach(items, function (item) {
          var isDuplicate = false;

          for (var i = 0; i < newItems.length; i++) {
            if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            newItems.push(item);
          }
        });
        items = newItems;
      }
      return items;
    };
  })
  .filter('exchange', ['appstate', 'precision', function (appstate, precision) {
    var map;

    appstate.register('exchange_rate', function (globalRates) {
      // build rate map anytime the exchange rate changes.
      globalRates.forEach(function (r) {
        map[r.currency_id] = r.rate;
      });
    });

    return function (value, currency_id) {
      value = value || 0;
      var scalar = map[currency_id] || 1;
      return map ? precision.round(scalar*value, 2) : precision.round(value, 2);
    };
  }])

  // Filter is depreciated, structure maintained until it has been confirmed removed
  .filter('intlcurrency', ['$sce',
    function ($sce) {
      
      return function (value) {
        var depreciateElement = '<span style="color : red;">Filter Depriciated</span>';
        var depreciateScript = '<script>alert("DEPRECIARED FILTER. It can be dangerous to trust templated strings as HTML within browser applications, If someone could sneak a <script> tag into the template they could execute code to create an annoying alert for example. Please use currency instead.");</script>';
        return $sce.trustAsHtml(depreciateElement.concat(depreciateScript));
      };
    }]); 

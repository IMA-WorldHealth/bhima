angular.module('bhima.filters')
.filter('unique', UniqueFilter);

/**
 * Unique Filter
 *
 * Filters arrays or objects based on a property.
 *
 * @deprecated This functionality should be clearly handled and explained via
 * comments in the controller or service code.
 */
function UniqueFilter() {
  return function unique(items, filterOn) {

    // throw a deprecation warning
    console.warning('[DEPRECATED] The unique filter is deprecated. Please explicitly filter your items in a service or controller.');

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
}

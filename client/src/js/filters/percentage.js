angular.module('bhima.filters')
.filter('percentage', PercentageFilter);

/**
 * Percentage Filter
 *
 * The percentage filter accepts a number and returns it as a percentage.
 */
function PercentageFilter() {
  return function percentage(number) {

    // escape if no input was passed in
    if (angular.isUndefined(number)) { return ''; }

    // cast value as number (or NaN)
    var value = Number(number);

    // angular's isNumber() method reports NaNs as numbers
    if (!angular.isNumber(value) || isNaN(value)) { return number; }

    // return the value + a percentage sign
    return value + '%';
  };
}


angular.module('bhima.filters')
.filter('boolean', function BooleanFilter () {
  return function boolean(input) {
    return Boolean(Number(input));
  };
});

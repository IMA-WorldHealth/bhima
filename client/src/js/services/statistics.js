angular.module('bhima.services')
.service('StatisticService', StatisticService);

/*
*  Statistic Service
*  @constructor
*
*  Allows various statistical operations to be performed
*  on an array.
*/
function StatisticService() {
  var service = this;

  // sums an array of numbers
  function sum(array) {
    return array.reduce(function (a,b) {
      return a + b;
    }, 0);
  }

  // return the mean of an array
  service.mean = function (array) {
    return sum(array) / array.length;
  };

  // return the median of an array
  service.median = function (array) {
    array.sort(function (a,b) { return (a > b) ? 1 : (a < b) ? -1 : 0; });
    return array[Math.floor(array.length / 2)];
  };

  // calculate population variance
  service.variance = function (array) {
    var mean = service.mean(array);
    return service.mean(array.map(function (v) { return Math.pow(v - mean, 2); }));
  };

  // calculate the population standard deviation
  service.standardDeviation= function (array) {
    return Math.sqrt(service.variance(array));
  };

  service.standardError = function (array) {
    return service.standardDeviation(array) / Math.sqrt(array.length);
  };
}

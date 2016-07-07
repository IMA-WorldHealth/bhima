angular.module('bhima.services')
.service('util', UtilService);

UtilService.$inject = ['$filter', 'moment' ];

/**
 * @class util
 *
 * @description
 * Common utilities for the application
 */
function UtilService($filter, moment) {
  var service = this;

  service.unwrapHttpResponse = function unwrapHttpResponse(response) {
    return response.data;
  };

  /** @todo comments showing usage */
  service.filterFormElements = function filterFormElements(formDefinition, requireDirty) {
    var response = {};

    angular.forEach(formDefinition, function (value, key) {

      // Determine angular elements, these can be ignored
      var isAngularAttribute = key.substring(0, 1) === '$';

      if (!isAngularAttribute) {

        // Only format and assign dirty values that have changed
        if (requireDirty && !value.$dirty) {
          return;
        }

        // any standard ng-model element will provide an $modelValue, according
        // to the latest 2.x standards more complex bhima components or bhima
        // component wrappers will expose $bhValue

        // accounts for empty string values
        response[key] = angular.isDefined(value.$modelValue) ? value.$modelValue : value.$bhValue;
      }
    });
    return response;
  };

  // Define the minimum date for any patient data
  service.defaultBirthMonth = '06-01';

  // Define the maxLength By Value
  service.length250 = 250;
  service.length200 = 200;
  service.length150 = 150;
  service.length100 = 100;
  service.length70 = 70;
  service.length50 = 50;
  service.length40 = 40;
  service.length30 = 30;
  service.length20 = 20;
  service.length16 = 16;
  service.length12 = 12;

  // utility function
  service.clean = function clean(o) {
    // clean off the $$hashKey and other angular bits and delete undefined
    var cleaned = {};

    for (var k in o) {
      if (k !== '$$hashKey' && angular.isDefined(o[k]) && o[k] !== '' && o[k] !== null) {
        cleaned[k] = o[k];
      }
    }

    return cleaned;
  };

  // moment() provides the current date, similar to the new Date() API. This requests the difference between two dates
  service.getMomentAge = function (date, duration) {
    return duration ? moment().diff(date, duration) : moment().diff(date);
  };
}

angular.module('bhima.services')
.service('util', UtilService);

UtilService.$inject = ['$filter', 'moment' ];

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

  service.formatDate = function formatDate(dateString) {
    return new Date(dateString).toDateString();
  };

  service.htmlDate = function htmlDate (date) {
    return $filter('date')(new Date(date), 'yyyy-MM-dd');
  };

  service.convertToMysqlDate = function (dateParam) {
    var date = !!dateParam ? new Date(dateParam) : new Date(),
      annee,
      mois,
      jour;
    annee = String(date.getFullYear());
    mois = String(date.getMonth() + 1);
    if (mois.length === 1) {
      mois = '0' + mois;
    }

    jour = String(date.getDate());
    if (jour.length === 1) {
      jour = '0' + jour;
    }
    return annee + '-' + mois + '-' + jour;
  };

  service.sqlDate = service.convertToMysqlDate;

  service.isDateAfter = function (date1, date2) {
    date1 = new Date(date1).setHours(0,0,0,0);
    date2 = new Date(date2).setHours(0,0,0,0);
    return date1 > date2;
  };

  service.areDatesEqual = function (date1, date2) {
    date1 = new Date(date1).setHours(0,0,0,0);
    date2 = new Date(date2).setHours(0,0,0,0);
    return date1 === date2;
  };

  service.isDateBetween = function (date, dateFrom, dateTo) {
    date = new Date(date).setHours(0,0,0,0);
    dateFrom = new Date(dateFrom).setHours(0,0,0,0);
    dateTo = new Date(dateTo).setHours(0,0,0,0);
    return ((date>=dateFrom) && (date<=dateTo));
  };

  // Normalize a name:
  //  * remove all extra whitespace
  //  * capitalize the first letter of each word in the name
  //    (lowercase the rest of each word)
  //  * Undefined names are not changed (for form fields)
  service.normalizeName = function (name) {
    if (typeof name === 'undefined') {
      return name;
      }
    var names = name.trim().split(/\s+/);
    for(var i = 0; i < names.length; i++) {
      names[i] = names[i].charAt(0).toUpperCase() + names[i].slice(1).toLowerCase();
    }
    return names.join(' ');
  };

  // Define the minimum date for any patient data
  service.defaultBirthMonth = '06-01';
  service.minDOB = new Date('1900-01-01');
  service.maxDOB = new Date();

  // Define the maxlength for text
  service.maxTextLength = 1000;

  // Define the maxLength By Value
  service.length250 = 250;
  service.length200 = 200;
  service.length150 = 150;
  service.length100 = 100;
  service.length70 = 70;
  service.length50 = 50;
  service.length50 = 45;
  service.length40 = 40;
  service.length30 = 30;
  service.length20 = 20;
  service.length16 = 16;
  service.length12 = 12;

  // TODO This value is set in angular utilities - it could be configured on the enterprise
  service.minimumDate = new Date('1900-01-01');

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

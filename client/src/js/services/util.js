angular.module('bhima.services')
.service('util', UtilService);

UtilService.$inject = ['$filter' ];

function UtilService($filter) {
  var service = this;

  service.unwrapHttpResponse = function unwrapHttpResponse(response) {
    return response.data;
  };

  service.filterDirtyFormElements = function filterDirtyFormElements(formDefinition) {

    console.log('[util] formDefintion', formDefinition);
    var response = {};

    angular.forEach(formDefinition, function (value, key) {

      // Determine angular elements, these can be ignored
      var isAngularAttribute = key.substring(0, 1) === '$';

      if (!isAngularAttribute) {

        // Only format and assign dirty values that have changed
        if (value.$dirty) {

          // any standard ng-model element will provide an $modelValue, according
          // to the latest 2.x standards more complex bhima components or bhima
          // component wrappers will expose $bhValue

          // accounts for empty string values
          response[key] = angular.isDefined(value.$modelValue) ? value.$modelValue : value.$bhValue;
        }
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

  // TODO This value is set in angular utilities - it could be configured on the enterprise
  service.minimumDate = new Date('1900-01-01');
}

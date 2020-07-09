angular.module('bhima.services')
  .service('SearchModalUtilService', SearchModalUtilService);

SearchModalUtilService.$inject = [];

function SearchModalUtilService() {
  const service = this;

  service.getChanges = (searchQueries, changes, displayValues, lastDisplayValues) => {

    // push all searchQuery values into the changes array to be applied
    angular.forEach(searchQueries, (value, key) => {
      if (angular.isDefined(value)) {
        // default to the original value if no display value is defined
        const displayValue = displayValues[key] || lastDisplayValues[key] || value;
        changes.post({ key, value, displayValue });
      }
    });

    return changes.getAll();
  };
}

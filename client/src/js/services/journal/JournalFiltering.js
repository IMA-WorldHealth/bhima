angular.module('bhima.services')
.service('JournalFilteringService', JournalFilteringService);

JournalFilteringService.$inject = [];

/**
 * Posting Journal Filter Service
 *
 * This service is responsible for defining the global configuration for
 * filtering in the journal UI grid
 */
function JournalFilteringService() {
  var service = this;

  function filterByDate (searchValue, cellValue) {
    var cellDate = new Date(cellValue);
    var cellMonth = cellDate.getMonth() < 9 ? '0' + (cellDate.getMonth() + 1) : (cellDate.getMonth() + 1);
    var cellDateLong = cellDate.getDate() < 10 ? '0' + (cellDate.getDate()) : (cellDate.getDate());
    var cellDateString = (cellDate.getYear() + 1900) + '-' + cellMonth + '-' + cellDateLong;
    searchValue = searchValue.replace(/\\/g, '');
    return cellDateString.indexOf(searchValue) !== -1;
  }

  function filterInstance(gridOptions) {
    // global filtering configuration
    gridOptions.enableFiltering = true;

    return {
      byDate : filterByDate
    };
  }

  return filterInstance;
}

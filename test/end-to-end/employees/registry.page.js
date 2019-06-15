/* eslint  */
/**
 * This class represents an employee registry page
 * behaviour so it is an employee page object
 */

const FU = require('../shared/FormUtils');
const grid = require('../shared/GridUtils');
const Filters = require('../shared/components/bhFilters');

class EmployeeRegistryPage {
  constructor() {
    this.gridId = 'employee-registry';
    this.filters = new Filters();
  }

  employeeCount(number, message) {
    return grid.expectRowCount(this.gridId, number, message);
  }

  search() {
    return FU.buttons.search();
  }

  clearFilter() {
    return this.filters.resetFilters();
  }
}

module.exports = EmployeeRegistryPage;

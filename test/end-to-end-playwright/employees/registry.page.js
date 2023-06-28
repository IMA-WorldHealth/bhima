const TU = require('../shared/TestUtils');
const grid = require('../shared/GridUtils');
const Filters = require('../shared/components/bhFilters');

/**
 * This class represents an employee registry page
 * behaviour so it is an employee page object
 */

class EmployeeRegistryPage {
  constructor() {
    this.gridId = 'employee-registry';
    this.filters = new Filters();
  }

  expectEmployeeCount(number, message) {
    return grid.expectRowCount(this.gridId, number, message);
  }

  employeeCount() {
    return
  }

  search() {
    return TU.buttons.search();
  }

  async clearFilter() {
    await this.filters.resetFilters();
    return TU.waitForSelector('div.ui-grid-footer');
  }
}

module.exports = EmployeeRegistryPage;

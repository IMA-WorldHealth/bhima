const TU = require('../TestUtils');

const NO_FILTERS_ATTRIBUTE = '[data-bh-filter-bar-no-filters]';
const CUSTOM_FILTER_ATTRIBUTE = '[data-bh-filter-bar-custom-filters]';
const DEFAULT_FILTER_ATTRIBUTE = '[data-bh-filter-bar-default-filters]';

class Filters {

  async getCustomFilterCount() {
    const customFilters = await TU.locator(CUSTOM_FILTER_ATTRIBUTE);
    const filters = await customFilters.locator('li');
    return filters.count();
  }

  async getDefaultFilterCount() {
    const defaultFilters = await TU.locator(DEFAULT_FILTER_ATTRIBUTE);
    const filters = await defaultFilters.locator('li');
    return filters.count();
  }

  async resetFilters() {
    const customFilters = await TU.locator(CUSTOM_FILTER_ATTRIBUTE);
    const hasCustomFilters = await customFilters.isVisible();

    if (hasCustomFilters) {
      const buttons = await (await customFilters.locator('a > .fa-close')).all();
      const clicks = buttons.map(button => button.click());
      return Promise.all(clicks);
    }
    return true;
  }

  async hasFilters() {
    return (await TU.locator(NO_FILTERS_ATTRIBUTE)).count() > 0;
  }
}

module.exports = Filters;

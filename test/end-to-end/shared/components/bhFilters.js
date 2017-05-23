const NO_FILTERS_FLAG = '[data-bh-filter-bar-no-filters]';
const CUSTOM_FILTER_FLAG = '[data-bh-filter-bar-custom-filters]';
const DEFAULT_FILTER_FLAG = '[data-bh-filter-bar-default-filters]';

class Filters {
  constructor() {
    this.customFilters = $(CUSTOM_FILTER_FLAG);
    this.defaultFilters = $(DEFAULT_FILTER_FLAG);
  }

  getCustomFilterCount() {
    return this.customFilters.$$('li').count();
  }

  getDefaultFilterCount() {
    return this.defaultFilters.$$('li').count();
  }

  resetFilters() {
    this.customFilters.isPresent()
      .then(hasCustomFilters => {
        let promise;

        if (hasCustomFilters) {
          promise = this.customFilters
            .$$('a > .fa-close').each(button => button.click());
        }

        return promise;
      });
  }
}

Filters.hasFilters = () => $(NO_FILTERS_FLAG).isPresent();

module.exports = Filters;

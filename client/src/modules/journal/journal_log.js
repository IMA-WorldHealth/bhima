angular.module('bhima.controllers')
  .controller('JournalLogController', JournalLogController);

JournalLogController.$inject = ['JournalLogService', 'NotifyService', '$state'];

function JournalLogController(Journal, Notify, $state) {
  const vm = this;

  vm.onRemoveFilter = onRemoveFilter;
  vm.openSearchModal = openSearchModal;

  function load(filters) {
    Journal.read(null, filters)
      .then(rows => {
        vm.data = rows.map(row => {
          if (row.value) {
            const line = Array.isArray(row.value) && row.value.length ? row.value[0] : row.value;
            row.transId = line.trans_id;
            row.description = line.description;
          }
          return row;
        });
      })
      .catch(Notify.handleError);
  }

  function openSearchModal() {
    const filtersSnapshot = Journal.filters.formatHTTP();
    Journal.openSearchModal(filtersSnapshot)
      .then((changes) => {
        Journal.filters.replaceFilters(changes);
        Journal.cacheFilters();
        vm.latestViewFilters = Journal.filters.formatView();
        return load(Journal.filters.formatHTTP(true));
      })
      .catch(angular.noop);
  }

  function onRemoveFilter(key) {
    Journal.removeFilter(key);
    Journal.cacheFilters();
    vm.latestViewFilters = Journal.filters.formatView();
    return load(Journal.filters.formatHTTP(true));
  }

  function startup() {
    const { filters } = $state.params;

    if (filters.length > 0) {
      Journal.filters.replaceFiltersFromState(filters);
    } else {
      Journal.loadCachedFilters();
    }

    load(Journal.filters.formatHTTP(true));
    vm.latestViewFilters = Journal.filters.formatView();
  }

  startup();
}

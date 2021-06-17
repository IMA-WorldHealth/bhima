angular.module('bhima.controllers')
  .controller('SearchStockRequisitionModalController', SearchStockRequisitionModalController);

// dependencies injections
SearchStockRequisitionModalController.$inject = [
  'data', 'util', 'Store', '$uibModalInstance', 'PeriodService', 'StockService',
  'SearchModalUtilService', 'NotifyService', '$translate',
];

function SearchStockRequisitionModalController(data, util, Store, Instance, Periods, Stock, SearchModal, Notify, 
  $translate) {
  const vm = this;
  const changes = new Store({ identifier : 'key' });

  vm.filters = data;
  vm.searchQueries = {};
  vm.defaultQueries = {};

  const searchQueryOptions = [
    'depot_uuid', 'date_from', 'date_to', 'user_id', 'status',
  ];

  const displayValues = {};
  const lastDisplayValues = Stock.filter.requisition.getDisplayValueMap();

  vm.onSelectPeriod = function onSelectPeriod(period) {
    const periodFilters = Periods.processFilterChanges(period);
    periodFilters.forEach(filterChange => {
      changes.post(filterChange);
    });
  };

  vm.onSelectDepot = function onSelectDepot(depot) {
    vm.searchQueries.depot_uuid = depot.uuid;
    displayValues.depot_uuid = depot.text;
  };

  vm.onSelectUser = function onSelectUser(user) {
    vm.searchQueries.user_id = user.id;
    displayValues.user_id = user.display_name;
  };

  vm.onSelectRequestor = requestor => {
    vm.searchQueries.requestor_uuid = requestor.uuid;
    displayValues.requestor_uuid = requestor.name || requestor.text;
  };

  vm.searchQueries = util.maskObjectFromKeys(data, searchQueryOptions);

  if (data.limit) {
    vm.defaultQueries.limit = data.limit;
  }

  vm.onSelectLimit = function onSelectLimit(value) {
    if (angular.isDefined(value)) {
      changes.post({ key : 'limit', value });
    }
  };

  // load all Requisition status
  Stock.status.read()
    .then(statuses => {
      statuses.forEach((item) => {
        item.plainText = $translate.instant(item.title_key);
        item.checked = 0;
      });

      statuses.sort((a, b) => a.plainText > b.plainText);

      vm.requisitionStatus = statuses;
    })
    .catch(Notify.handleError);

  vm.clear = function clear(key) {
    delete vm.searchQueries[key];
  };

  vm.cancel = Instance.dismiss;

  vm.submit = function submit() {
    vm.searchQueries.status = [];
    let statusText = '/';

    if (vm.requisitionStatus.length) {
      vm.requisitionStatus.forEach(status => {
        if (status.checked) {
          vm.searchQueries.status.push(status.id);
          statusText += `${status.plainText} / `;
        }
      });

      displayValues.status = statusText;
    }

    const loggedChanges = SearchModal.getChanges(vm.searchQueries, changes, displayValues, lastDisplayValues);
    return Instance.close(loggedChanges);
  };
}

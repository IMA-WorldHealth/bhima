angular.module('bhima.controllers')
.controller('DebtorGroupController', DebtorGroupController);

DebtorGroupController.$inject = ['$state', 'DebtorGroupService', 'AccountService', 'PriceListService', '$interval'];

/**
 * This controller is responsible for loading debtor groups and providing basic
 * sorting/ filtering utilites.
 *
 * @todo  Pass debtor groups into create/ update states to reduce the number of
 *        HTTP requests made - these pages should also link back to this controller
 *        without calling refresh : true and just passing back the object that changed
 *
 * @module finance/debtors/groups
 */
function DebtorGroupController($state, DebtorGroups, Accounts, Prices, $interval) {
  var vm = this;

  // pagination configuration
  /** @todo this should all be moved to a component */
  vm.pageSize     = 10;
  vm.currentPage  = 1;
  vm.debtorGroups = [];

  vm.toggleFilter = toggleFilter;
  vm.setOrder = setOrder;

  vm.state = $state;

  vm.sortOptions = [
    { attribute : 'name', key : 'TABLE.COLUMNS.SORTING.NAME_ASC', reverse : false },
    { attribute : 'name', key : 'TABLE.COLUMNS.SORTING.NAME_DSC', reverse : true },
    { attribute : 'created_at', key : 'TABLE.COLUMNS.SORTING.CREATED_DSC', reverse : true },
    { attribute : 'created_at', key : 'TABLE.COLUMNS.SORTING.CREATED_ASC', reverse : false },
    { attribute : 'total_debtors', key : 'TABLE.COLUMNS.SORTING.TOTAL_ASC', reverse : true }
  ];

  /** @todo rename read method */
  DebtorGroups.read(null, { detailed : 1 })
    .then(function (result) {
      vm.debtorGroups = result;
    })
    .catch(handleException);

  function handleException(error) {

    // expose error to view
    vm.exception = error;
  }

  // Naive filter toggle - performance analysis should be done on this
  function toggleFilter() {
    if (vm.filterActive) {

      // clear the filter
      vm.filterActive = false;
      vm.filter = '';
    } else {

      vm.filterActive = true;
    }
  }

  function setOrder(attribute) {
    vm.sort = attribute;
  }
}

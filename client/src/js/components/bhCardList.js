angular.module('bhima.components')
  .component('bhCardList', {
    templateUrl : 'modules/templates/bhCardList.tmpl.html',
    controller : bhCardList,
    bindings : {
      data : '<',
      template : '@',
      name : '@', // name attribute to be sorted alphabetically and filtered
      age : '@?', // date attribute to be sorted by date
      size : '@?', // size attribute to be sorted largest to smallest
      id : '@?', // optional data override
    }
    ,
  });

bhCardList.$inject = ['$timeout'];

/**
 * @description
 * Component for displaying cards of information, providing sorting and filtering
 * components.
 *
 * Requires:
 * `data` : the array to iterate over
 * `name` : the entity display name that should be sorted and filtered
 * `template` : path to an HTML template that should be displayed for each element
 */
function bhCardList($timeout) {
  const $ctrl = this;
  const DEFAULT_IDENTIFIER = 'uuid';

  // name, age and size options will be added to this _if_ they are defined
  // by through bindings
  $ctrl.orderOptions = { active : false, available : [] };
  $ctrl.filterOptions = { active : false };

  // keep internal copy of data so that it is only exposed to the view once
  // an identifer has been determined

  $ctrl.$onInit = function onInit() {

    // setup defaults
    $ctrl.currentOrderAttribute = $ctrl.name;
    $ctrl.currentFilterAttribute = $ctrl.name;
    $ctrl.currentOrderReversed = false;

    $ctrl.identifier = $ctrl.id;

    // name is required
    $ctrl.orderOptions.available.push({ attribute : $ctrl.name, key : 'TABLE.COLUMNS.SORTING.NAME_ASC', reverse : false });
    $ctrl.orderOptions.available.push({ attribute : $ctrl.name, key : 'TABLE.COLUMNS.SORTING.NAME_DSC', reverse : true });

    if (angular.isDefined($ctrl.age)) {
      $ctrl.orderOptions.available.push({ attribute : $ctrl.age, key : 'TABLE.COLUMNS.SORTING.CREATED_ASC', reverse : false });
      $ctrl.orderOptions.available.push({ attribute : $ctrl.age, key : 'TABLE.COLUMNS.SORTING.CREATED_DSC', reverse : true });
    }

    if (angular.isDefined($ctrl.size)) {
      $ctrl.orderOptions.available.push({ attribute : $ctrl.size, key : 'TABLE.COLUMNS.SORTING.TOTAL_ASC', reverse : true });
    }
  };

  $ctrl.$onChanges = function onChanges(changes) {
    console.log(changes);
    if (changes.data && angular.isDefined(changes.data.currentValue)) {
      if (!$ctrl.identifier) {
        // no identifier override found
        $ctrl.identifier = defaultIdentifier(changes.data.currentValue);
        console.log('set up identifier', $ctrl.identifier);
      }
    }

    $ctrl.toggleFilter = function toggleFilter() {
      $ctrl.filterOptions.active = !$ctrl.filterOptions.active; $ctrl.filterOptions.value = {};
      console.log($ctrl.filterOptions);
    }

    $ctrl.setOrder = function setOrder(order) {
      $ctrl.orderOptions.current = order;
      $ctrl.orderOptions.active = angular.isDefined(order);

      console.log('setting order', $ctrl.orderOptions);
    }

    // attempt to pick an identifier based on common ids
    // this is overriden by binding a specific `id`
    // supported default identifiers are 'id' and 'uuid'
    function defaultIdentifier(data) {
      const sampleData = data[0] || {};
      return angular.isDefined(sampleData.uuid) ? 'uuid' : 'id';
    }
  }
}

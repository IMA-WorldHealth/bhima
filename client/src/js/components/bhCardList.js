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

function bhCardList() {
  const $ctrl = this;

  // name, age and size options will be added to this _if_ they are defined
  // by through bindings
  $ctrl.orderOptions = {};
  $ctrl.filterOptions = {};

  $ctrl.currentOrderAttribute = $ctrl.name;
  $ctrl.currentOrderReversed = false;
  $ctrl.currentFilterValue = undefined;

  $ctrl.identifier = $ctrl.id || 'uuid';

  $ctrl.$onInit = function onInit() {

    if (angular.isDefined($ctrl.age)) {
    }
  };

  $ctrl.$onChanges = function onChanges(changes) {
    console.log(changes);
  }
}

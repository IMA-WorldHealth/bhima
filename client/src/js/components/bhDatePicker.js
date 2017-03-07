angular.module('bhima.components')
.component('bhDatePicker', {
  templateUrl : '/partials/templates/bhDatePickerAction.tmpl.html',
  controller  : DatePickerController,
  bindings    : {
    date : '=',
    mode : '<',
  },
});

DatePickerController.$inject = ['$uibModal'];

/**
 * bhDatePicker Component
 *
 * An inline component for permits to the user to choose a date in a modal box
 *
 * @module components/bhDatePicker
 */
function DatePickerController(Modal) {
  var vm = this;

  var modalParameters = {
    size         : 'sm',
    backdrop     : 'static',
    animation    : true,
    templateUrl  : '/partials/templates/bhDatePicker.tmpl.html',
    controller   : DatePickerModalController,
    controllerAs : '$ctrl',
  };

  // bind methods
  vm.open = open;

  function open() {
    openDatePicker({ mode: vm.mode })
    .then(function (res) {
      vm.label = res;
    });
  }

  function openDatePicker() {
    var params = angular.extend(modalParameters, {
      resolve : {
        data : function dataProvider() { return {}; },
      },
    });
    var instance = Modal.open(params);
    return instance.result;
  }
}

/**
 * bhDatePicker Modal
 */
DatePickerModalController.$inject = ['$uibModalInstance', 'bhConstants', 'data'];

function DatePickerModalController(Instance, bhConstants, Data) {
  var vm = this;

  vm.selected = new Date();
  vm.dateFormat = bhConstants.dayOptions.format;

  vm.options = {
    datepickerMode : Data.mode || 'day',
    minDate        : vm.minDate,
    maxDate        : vm.maxDate,
    showWeeks      : false,
  };

  vm.submit = submit;
  vm.cancel = Instance.close;

  function submit() {
    Instance.close(vm.selected);
  }
}

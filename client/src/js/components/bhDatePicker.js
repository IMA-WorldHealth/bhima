angular.module('bhima.components')
.component('bhDatePicker', {
  templateUrl : '/modules/templates/bhDatePickerAction.tmpl.html',
  controller  : DatePickerController,
  bindings    : {
    date     : '<', // set the date once as the initial date and use callbacks to change it later
    format   : '<',
    mode     : '@', // will this ever change?  If so, we can use '<'
    required : '<',
    onChange : '&', // use a callback to notify for changes
  },
});

DatePickerController.$inject = ['$uibModal', 'bhConstants'];

/**
 * bhDatePicker Component
 *
 * An inline component for permits to the user to choose a date in a modal box
 *
 * @module components/bhDatePicker
 */
function DatePickerController(Modal, bhConstants) {
  var vm = this;

  var modalParameters = {
    size         : 'sm',
    backdrop     : 'static',
    animation    : true,
    templateUrl  : '/modules/templates/bhDatePicker.tmpl.html',
    controller   : DatePickerModalController,
    controllerAs : '$ctrl',
  };

  // bind methods
  vm.dateFormat = vm.format || bhConstants.dayOptions.format;
  vm.notifyDateChange = notifyDateChange;
  vm.open = open;

  // on date change
  function notifyDateChange() {
    vm.onChange({ date: vm.date });
  }

  function open() {
    openDatePicker({ mode: vm.mode })
    .then(function (res) {
      // notify the parent controller of a date change via a callback
      vm.onChange({ date: res });
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
DatePickerModalController.$inject = ['$uibModalInstance', 'data'];

function DatePickerModalController(Instance, Data) {
  var vm = this;

  vm.selected = new Date();

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

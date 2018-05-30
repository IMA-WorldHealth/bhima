angular.module('bhima.controllers')
  .controller('HolidayModalController', HolidayModalController);

HolidayModalController.$inject = [
  '$state', 'HolidayService', 'ModalService', 'NotifyService', 'appcache', 'moment',
];

function HolidayModalController($state, Holidays, ModalService, Notify, AppCache, moment) {
  const vm = this;
  vm.holiday = {};

  const cache = AppCache('HolidayModal');

  if ($state.params.creating || $state.params.id) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Holidays.read(vm.stateParams.id)
      .then((holiday) => {
        holiday.dateFrom = new Date(holiday.dateFrom);
        holiday.dateTo = new Date(holiday.dateTo);

        vm.holiday = holiday;
      })
      .catch(Notify.handleError);
  }

  // custom filter employee_uuid
  vm.onSelectEmployee = function onSelectEmployee(employee) {
    vm.holiday.employee_uuid = employee.uuid;
  };

  // submit the data to the server from all two forms (update, create)
  function submit(holidayForm) {

    if (holidayForm.$invalid) { return 0; }

    vm.holiday.dateFrom = moment(vm.holiday.dateFrom).format('YYYY-MM-DD');
    vm.holiday.dateTo = moment(vm.holiday.dateTo).format('YYYY-MM-DD');

    const promise = (vm.isCreating) ?
      Holidays.create(vm.holiday) :
      Holidays.update(vm.holiday.id, vm.holiday);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS';
        Notify.success(translateKey);
        $state.go('holidays', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('holidays');
  }
}

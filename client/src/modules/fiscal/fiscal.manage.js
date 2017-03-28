angular.module('bhima.controllers')
  .controller('FiscalManagementController', FiscalManagementController);

FiscalManagementController.$inject = [
  '$state', 'FiscalService', 'NotifyService', 'ModalService', 'util', 'moment',
];

/**
 * This controller is responsible for creating and updating a fiscal year. It provides
 * utility functions for submission and error handling.
 */
function FiscalManagementController($state, Fiscal, Notify, Modal, util, moment) {
  var vm = this;

  // state variables
  vm.isUpdateState = $state.current.name === 'fiscal.update';
  vm.isListState = $state.current.name === 'fiscal.list';
  vm.isCreateState = $state.current.name === 'fiscal.create';

  // identifier
  var id = $state.params.id;
  var isUpdate = (id && vm.isUpdateState);

  // global variables
  vm.fiscal = {};
  vm.submit = submit;
  vm.maxLength = util.maxTextLength;
  vm.numberOfMonths = numberOfMonths;

  // expose to the view
  vm.closingFiscalYear = closingFiscalYear;

  /**
   * @function init
   * @description init data for the module
   */
  function init() {
    if (id && vm.isUpdateState) {
      // concerned fiscal year
      Fiscal.read(id)
      .then(function (fiscalYear) {
        vm.fiscal = fiscalYear;
        vm.fiscal.start_date = new Date(vm.fiscal.start_date);
        vm.fiscal.end_date = new Date(vm.fiscal.end_date);
      })
      .catch(Notify.handleError);
    }

    // previous fiscal year
    Fiscal.read(null, { detailed: 1})
    .then(function (previous) {
      if (!previous.length) { return ; }

      vm.previous_fiscal_year = previous.map(function (fy) {
        fy.hrLabel = fy.label
          .concat(' (', moment(fy.start_date).format('DD MMM YYYY').toString(), ' - ')
          .concat(moment(fy.end_date).format('DD MMM YYYY').toString(), ')');
        return fy;
      });
    })
    .catch(Notify.handleError);
  }

  /**
   * @method closingFiscalYear
   * @description launch the modal for closing a fiscal year
   */
  function closingFiscalYear() {
    if (!vm.isUpdateState) { return; }

    Modal.openClosingFiscalYear(vm.fiscal)
      .then(function (res) {
        if (!res) { return; }
        $state.go('fiscal.list', null, { reload: true });
      });
  }

  /**
   * @function numberOfMonths
   * @description get the number of months between two dates
   */
  function numberOfMonths() {
    if (!vm.fiscal) { return ; }

    var start_date = moment(vm.fiscal.start_date);
    var end_date = moment(vm.fiscal.end_date);
    vm.fiscal.number_of_months = Math.ceil(end_date.diff(start_date, 'months', true));
  }

  /**
   * @method submit
   * @description submit the form
   */
  function submit(form) {

    // ensure all Angular form validation checks have passed
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // get the number of months
    numberOfMonths();

    var promise = isUpdate ? Fiscal.update(id, vm.fiscal) : Fiscal.create(vm.fiscal);

    return promise
      .then(function () {
        Notify.success(isUpdate ? 'FORM.INFO.UPDATE_SUCCESS' : 'FORM.INFO.CREATE_SUCCESS');

        // navigate back to list view
        $state.go('fiscal.list', null, { reload: true });
      })
      .catch(Notify.handleError);
  }

  // excecute
  init();
}

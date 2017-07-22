// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  'EmployeeService', 'ServiceService', 'GradeService', 'FunctionService',
  'CreditorGroupService', 'util', 'NotifyService',
  'bhConstants', 'ReceiptModal', 'SessionService',
];

function EmployeeController(Employees, Services, Grades, Functions, CreditorGroups, util, Notify, bhConstants, Receipts, Session) {
  var vm = this;
  vm.enterprise = Session.enterprise;

  // Expose lenths from util
  vm.length20 = util.length20;

  // Expose validation rule for date
  vm.datepickerOptions = {
    maxDate : new Date(),
    minDate : bhConstants.dates.minDOB,
  };

  // Expose employee to the scope
  vm.employee = {};

  // Expose methods to the scope
  vm.submit = submit;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor =  function onSelectDebtor(debtorGroup) {
    vm.employee.debtor_group_uuid = debtorGroup.uuid;
  }

  // Loading Grades
  Grades.read(null, { detailed : 1 }).then(function (data) {
    data.forEach(function (g) {
      g.format = g.code + ' - ' + g.text;
    });
    vm.grades = data;
  }).catch(Notify.handleError);

  // Loading Creditor Groups
  CreditorGroups.read().then(function (data) {
    vm.creditorGroups = data;
  }).catch(Notify.handleError);

  // Loading Services
  Services.read().then(function (services) {
    vm.services = services;
  }).catch(Notify.handleError);

  // Loading Functions
  Functions.read().then(function (data) {
    vm.functions = data;
  }).catch(Notify.handleError);


  // submit the data to the server
  function submit(employeeForm) {
    if (employeeForm.$invalid) { return Notify.danger('FORM.ERRORS.INVALID'); }
    return Employees.create(vm.employee)
      .then(function (feedBack) {
        Receipts.patient(feedBack.patient_uuid, true);

        // reset form state
        employeeForm.$setPristine();
        employeeForm.$setUntouched();
        vm.employee = {};
      })
      .catch(Notify.handleError);
  }
}

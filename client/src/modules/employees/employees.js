// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  'EmployeeService', 'ServiceService', 'GradeService', 'FunctionService',
  'CreditorGroupService', 'DebtorGroupService', 'util', 'NotifyService',
  'bhConstants', 'ReceiptModal'
];

function EmployeeController(Employees, Services, Grades, Functions, CreditorGroups, DebtorGroups, util, Notify, bhConstants, Receipts) {
  var vm = this;

  // Expose lenths from util
  vm.length20 = util.length20;

  // Expose validation rule for date
  vm.datepickerOptions = {
    maxDate : new Date(),
    minDate : bhConstants.dates.minDOB
  };

  // Expose employee to the scope
  vm.employee = {};

  // Expose methods to the scope
  vm.submit = submit;

  // Loading Grades
  Grades.read(null, { detailed : 1 }).then((data) => {
    data.forEach((g) => {
      g.format = `${g.code} - ${g.text}`;
    });      
    vm.grades = data;
  }).catch(Notify.handleError);

  // Loading Creditor Groups
  CreditorGroups.read().then((data) => {
    vm.creditorGroups = data;
  }).catch(Notify.handleError);

  // Loading Debtor Groups
  DebtorGroups.read().then((data) => {
    vm.debtorGroups = data;
  }).catch(Notify.handleError);

  // Loading Services
  Services.read().then((services) => {
    vm.services = services;
  }).catch(Notify.handleError);    

  // Loading Functions
  Functions.read().then((data) => {
    vm.functions = data;
  }).catch(Notify.handleError);


  // submit the data to the server
  function submit(employeeForm) {
    var promise;

    if (employeeForm.$invalid) { return Notify.danger('FORM.ERRORS.INVALID');}
    if (!employeeForm.$dirty) { return Notify.danger('FORM.ERRORS.NO_DATA_PROVIDED'); }

    return Employees.create(vm.employee)
      .then((feedBack) =>  {
        Receipts.patient(feedBack.patient_uuid, true);

        // reset form state
        employeeForm.$setPristine();
        employeeForm.$setUntouched();
        vm.employee = {};
      })
      .catch(Notify.handleError);
  }
}

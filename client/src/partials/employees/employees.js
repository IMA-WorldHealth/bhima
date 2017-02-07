// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  'EmployeeService', 'ServiceService', 'GradeService', 'FunctionService',
  'CreditorGroupService', 'DebtorGroupService', 'util', 'NotifyService',
  'bhConstants'
];

function EmployeeController(Employees, Services, Grades, Functions, CreditorGroups, DebtorGroups, util, Notify, bhConstants) {
  var vm = this;

  vm.loading = false;
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;

  // Define limits for dates
  vm.minDOB = bhConstants.dates.minDOB;
  vm.maxDOB = bhConstants.dates.maxDOB;
  vm.maxDateEmbauche = Employees.maxDateEmbauche;

  // max length field for Employee Registration
  vm.maxLength = bhConstants.maxTextLength;
  vm.length70 = util.length70;
  vm.length50 = util.length50;
  vm.length30 = util.length30;
  vm.length20 = util.length20;

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load Employees
    refreshEmployees();

    // load Services
    Services.read().then(function (services) {
      vm.services = services;
    }).catch(Notify.handleError);

    // load Grades
    Grades.read(null, { detailed : 1 }).then(function (data) {
      data.forEach(function (g) {
        g.format = g.code + ' - ' + g.text;
      });
      vm.grades = data;
    }).catch(Notify.handleError);

    // load Functions
    Functions.read().then(function (data) {
      vm.functions = data;
    }).catch(Notify.handleError);

    // load Creditor Groups
    CreditorGroups.read().then(function (data) {
      vm.creditorGroups = data;
    }).catch(Notify.handleError);

    // load Debtor Groups
    DebtorGroups.read().then(function (data) {
      vm.debtorGroups = data;
    }).catch(Notify.handleError);

  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.employee = { locked : 0 };
    vm.employee = {};
  }

  // switch to update mode
  // data is an object that contains all the information of a employee
  function update(data) {
    // Sanitise DOB for HTML Date Input
    data.dob = new Date(data.dob);
    // Sanitise DATE_EMBAUCHE for HTML Date Input
    data.date_embauche = new Date(data.date_embauche);
    data.code = data.code_employee;

    vm.employee= data;
    vm.view = 'update';
  }


  // refresh the displayed Employees
  function refreshEmployees() {
    return Employees.read()
    .then(function (data) {
      vm.employees = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = (vm.view === 'create');
    var employee = angular.copy(vm.employee);

    promise = (creation) ?
      Employees.create(employee) :
      Employees.update(employee.id, employee);

    promise
      .then(function (response) {
        return refreshEmployees();
      })
      .then(function () {
        Notify.success(creation ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  startup();
}

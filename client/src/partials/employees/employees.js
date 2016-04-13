// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  'EmployeeService', 'ServiceService', 'GradeService', 'FunctionService', 'CreditorGroupService', 'DebtorGroupService', 'util'
];

function EmployeeController(Employees, Services, Grades, Functions, CreditorGroups, DebtorGroups, util) {
  var vm = this;
  var session = vm.session = {};

  session.loading = false;  
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;


  // Define limits for DOB
  vm.minDOB = util.minDOB;
  vm.maxDOB = util.maxDOB;    
  vm.maxDateEmbauche = Employees.maxDateEmbauche;



  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    session.loading = true;

    // load Employees
    refreshEmployees();

    // load Services
    Services.read().then(function (data) {
      vm.services = data;
    }).catch(handler);

    // load Grades
    Grades.read(null, { detailed : 1 }).then(function (data) {
      data.forEach(function (g) {
        g.format = g.code + ' - ' + g.text;
      });
      vm.grades = data;
    }).catch(handler);

    // load Functions
    Functions.read().then(function (data) {
      vm.functions = data;
    }).catch(handler);

    // load Creditor Groups
    CreditorGroups.read().then(function (data) {
      vm.creditorGroups = data;
    }).catch(handler);

    // load Debtor Groups
    DebtorGroups.read().then(function (data) {
      vm.debtorGroups = data;
    }).catch(handler);

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
      data.forEach(function (employee) {
        employee.displayName = employee.prenom;

        if (employee.prenom) {
          employee.displayName += ', ' + employee.name;
        }

        if (employee.postnom) {
          employee.displayName += ' - ' + employee.postnom;
        }
      });

      vm.employees = data;
      session.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

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
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();
}

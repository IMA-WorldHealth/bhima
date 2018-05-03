// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  'EmployeeService', 'ServiceService', 'GradeService', 'FunctionService',
  'CreditorGroupService', 'util', 'NotifyService','$state',
  'bhConstants', 'ReceiptModal', 'SessionService',
];

function EmployeeController(Employees, Services, Grades, Functions, CreditorGroups, util, Notify, $state, bhConstants, Receipts, Session) {
  var vm = this;
  var referenceId = $state.params.id;

  vm.enterprise = Session.enterprise;
  vm.isUpdating = $state.params.id ? true : false;

  vm.origin = '';

  if (referenceId) {
    Employees.read(referenceId)
    .then(function (employee) {
      formatEmployeeAttributes(employee);
      vm.origin = employee.hospital_no;
      vm.employee = employee;
    })
    .catch(function (error) {

      // handle error and update view to show no results - this could be improved
      Notify.handleError(error);
      vm.unknownId = true;
    });    
  }

  function formatEmployeeAttributes(employee) {

    // Sanitise DOB for Date Input
    employee.dob = new Date(employee.dob);
    employee.date_embauche = new Date(employee.date_embauche);
    
    // Assign name
    employee.name = employee.display_name;
    employee.displayGender = employee.sex;
    employee.displayAge = moment().diff(employee.dob, 'years');
  }

  // Expose lenths from util
  vm.length20 = util.length20;

  // Expose validation rule for date
  vm.datepickerOptions = {
    maxDate : new Date(),
    minDate : bhConstants.dates.minDOB,
  };

  var yearOptions = bhConstants.yearOptions;
  var dayOptions = bhConstants.dayOptions;

  setupRegistration();

  // Expose employee to the scope
  vm.employee = {};

  // default location
  vm.employee.origin_location_id = Session.enterprise.location_id;
  vm.employee.current_location_id = Session.enterprise.location_id;

  // Expose methods to the scope
  vm.submit = submit;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor =  function onSelectDebtor(debtorGroup) {
    vm.employee.debtor_group_uuid = debtorGroup.uuid;
  };

  function setupRegistration() {
    vm.employee = {};

    vm.fullDateEnabled = true;
    setDateComponent();
    vm.yob = null;
  }

  function setDateComponent() {
    var currentOptions = dayOptions;

    // set the database flag to track if a date is set to JAN 01 or if the date is unknown
    vm.employee.dob_unknown_date = !vm.fullDateEnabled;

    angular.merge(vm.datepickerOptions, currentOptions);
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
    var promise;

    if (employeeForm.$invalid) { return Notify.danger('FORM.ERRORS.INVALID'); }
    
    promise = (!referenceId) ?
      Employees.create(vm.employee) :
      Employees.update(referenceId, vm.employee);

    return promise
      .then(function (feedBack) {
        // reset form state
        employeeForm.$setPristine();
        employeeForm.$setUntouched();
        vm.employee = {};

        if (!referenceId) {
          Receipts.patient(feedBack.patient_uuid, true);
        } else {
          Notify.success('FORM.INFO.UPDATE_SUCCESS');
          $state.go('employeeRegistry', null, { reload : true }); 
        }
      })
      .catch(Notify.handleError);
  }
}

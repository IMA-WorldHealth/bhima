angular.module('bhima.controllers')
.controller('EmployeeController', EmployeeController);

EmployeeController.$inject = [
  '$translate', 'validate', 'uuid', 'messenger', 'connect', 'util'
];

function EmployeeController($translate, validate, uuid, messenger, connect, util) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  session.loading = false;

  var route = vm.route = {
    create : {
      title : 'EMPLOYEE.REGISTER',
      submit : 'EMPLOYEE.SUBMIT_NEW',
      method : registerEmployee
    },
    edit : {
      title : 'EMPLOYEE.EDIT',
      submit : 'EMPLOYEE.SUBMIT_EDIT',
      method : updateEmployee
    }
  };

  dependencies.employee = {
    query : '/employee_list/'
  };

  dependencies.creditorGroup = {
    query : {
      tables : {
        creditor_group : { columns : ['uuid', 'name', 'account_id', 'locked'] }
      }
    }
  };

  dependencies.debtorGroup = {
    query : {
      tables : {
        debitor_group : { columns : ['uuid', 'name'] }
      }
    }
  };

  dependencies.services = {
    query : {
      tables : {
        service : { columns : ['id','name']},
        project : { columns : ['abbr']}
      },
      join : ['service.project_id=project.id']
    }
  };

  dependencies.location = {
    query : '/location/villages'
  };

  dependencies.grade = {
    query : {
      tables : {
        grade : { columns : ['uuid', 'code', 'text']}
      }
    }
  };

  dependencies.fonction = {
    query : {
      tables : {
        'fonction' : { columns : ['id', 'fonction_txt']}
      }
    }
  };

  // Expose to the view
  vm.registerEmployee   = registerEmployee;
  vm.editEmployee       = editEmployee;
  vm.transitionRegister = transitionRegister;

  // start the module
  startup();

  // Functions
  vm.formatLocation = function formatLocation (location) {
    return [location.name, location.sector_name, location.province_name, location.country_name].join(', ');
  };

  vm.formatGrade = function formatGrade (grade) {
    return grade.code + ' - ' + grade.text;
  };

  vm.formatService = function formatService (service) {
    return service.name + ' [' + service.abbr + ']';
  };

  function initialise(model) {
    angular.extend(vm, model);
  }

  function startup() {
    // start up loading indicator
    session.loading = true;
    validate.process(dependencies)
    .then(initialise)
    .catch(handleError)
    .finally(function () { session.loading = false;
    });
  }

  function transitionRegister() {
    session.state = route.create;
    session.employee = {};
  }

  function registerEmployee() {
    var creditor_uuid = uuid();
    var debitor_uuid = uuid();

    writeCreditor(creditor_uuid)
    .then(function () {
      return writeDebitor(debitor_uuid);
    })
    .then(function () {
      return writeEmployee(creditor_uuid, debitor_uuid);
    })
    .then(registerSuccess)
    .catch(handleError);
  }

  function writeCreditor(creditor_uuid) {
    var prenom = cleanPrenom(session.employee.prenom);

    var creditor = {
      uuid : creditor_uuid,
      group_uuid : session.employee.creditor_group_uuid,
      text : 'Crediteur [' + prenom + session.employee.name + ' - ' + session.employee.postnom + ']'
    };

    return connect.post('creditor', [creditor], ['uuid']);
  }

  function writeDebitor(debitor_uuid) {
    var prenom = cleanPrenom(session.employee.prenom);

    var debitor = {
      uuid : debitor_uuid,
      group_uuid : session.employee.debitor_group_uuid,
      text : 'Debiteur [' + prenom + session.employee.name + ' - ' + session.employee.postnom + ']'
    };

    return connect.post('debitor', [debitor], ['uuid']);
  }

  function writeEmployee(creditor_uuid, debitor_uuid) {
    session.employee.locked = (session.employee.locked)? 1 : 0;
    session.employee.creditor_uuid = creditor_uuid;
    session.employee.debitor_uuid = debitor_uuid;
    // session.employee.dob must have a date object
    // util.sqlDate help us to get a "YYYY-MM-DD" date which avoid to have a date
    // with a day-1
    session.employee.dob = new Date(util.sqlDate(session.employee.dob));
    session.employee.date_embauche = new Date(util.sqlDate(session.employee.date_embauche));

    delete(session.employee.debitor_group_uuid);
    delete(session.employee.creditor_group_uuid);
    return connect.post('employee', [connect.clean(session.employee)], ['uuid']);
  }

  function registerSuccess() {
    session.employee = {};
    session.creditor = {};
    session.debitor = {};
    messenger.success($translate.instant('EMPLOYEE.REGISTER_SUCCESS'));

    // FIXME just add employee to model
    validate.refresh(dependencies, ['employee'])
    .then(function (model) {
      angular.extend(vm, model);
      session.state = null;
    })
    .catch(error);
  }

  function editEmployee(employee) {
    var emp = angular.copy(employee);
    emp.dob = new Date(employee.dob);
    emp.date_embauche = new Date(employee.date_embauche);
    emp.code = employee.code_employee;
    session.employee = emp;
    session.state = route.edit;
  }

  function editSuccess() {
    session.employee = {};
    session.creditor = {};
    session.debitor = {};
    messenger.success($translate.instant('EMPLOYEE.EDIT_SUCCESS'));

    // FIXME just add employee to model
    validate.refresh(dependencies, ['employee'])
    .then(function (model) {
      angular.extend(vm, model);
      session.state = null;
    })
    .catch(error);
  }

  function cleanPrenom (prenom) {
    if (prenom === '.' || prenom === ',') {
      prenom = '';
    } else {
      prenom = prenom + ', ';
    }
    return prenom;
  }

  function updateEmployee() {
    var prenom = cleanPrenom(session.employee.prenom);

    var creditor = {
      uuid : session.employee.creditor_uuid,
      group_uuid : session.employee.creditor_group_uuid,
      text : 'Crediteur [' + prenom + session.employee.name + ' - ' + session.employee.postnom + ']'
    };

    var debitor = {
      uuid : session.employee.debitor_uuid,
      group_uuid : session.employee.debitor_group_uuid,
      text : 'Debiteur [' + prenom + session.employee.name + ' - ' + session.employee.postnom + ']'
    };

    var employee = {
      id:            session.employee.id,
      code:          session.employee.code,
      prenom:        session.employee.prenom,
      name:          session.employee.name,
      postnom:       session.employee.postnom,
      sexe:          session.employee.sexe,
      dob:           util.sqlDate(session.employee.dob),
      date_embauche: util.sqlDate(session.employee.date_embauche),
      nb_spouse:     session.employee.nb_spouse,
      nb_enfant:     session.employee.nb_enfant,
      grade_id:      session.employee.grade_id,
      bank:          session.employee.bank,
      bank_account:  session.employee.bank_account,
      adresse:       session.employee.adresse,
      phone:         session.employee.phone,
      email:         session.employee.email,
      fonction_id:   session.employee.fonction_id,
      service_id:    session.employee.service_id,
      location_id:   session.employee.location_id,
      locked:        session.employee.locked
    };

    submitCreditorEdit(creditor)
    .then(function () {
      return submitDebitorEdit(debitor);
    })
    .then(function () {
      return submitEmployeeEdit(connect.clean(employee));
    })
    .then(editSuccess)
    .then(function (result) {
      session.state = null;
      session.employee = {};
    })
    .catch(handleError);
  }

  function submitCreditorEdit(creditor) {
    return connect.put('creditor', [creditor], ['uuid']);
  }

  function submitDebitorEdit(debitor) {
    return connect.put('debitor', [debitor], ['uuid']);
  }

  function submitEmployeeEdit(employee) {
    return connect.put('employee', [employee], ['id']);
  }

  function handleError(error) {
    // TODO Error Handling
    messenger.danger($translate.instant('EMPLOYEE.REGISTER_FAIL'));
    throw error;
  }

  function error(err) {
    console.error(err);
  }

}

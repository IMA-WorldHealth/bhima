angular.module('bhima.controllers')
.controller('HolidayController', HolidayController);

HolidayController.$inject = [
  '$translate', '$http', 'validate', 'messenger', 'connect',
  'util', 'SessionService'
];

/**
  * Holiday Controller
  * This controller is responsible to manage crud operations with holidays
  */
function HolidayController ($translate, $http, validate, messenger, connect, util, SessionService) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  dependencies.holidays = {
    query : {
      identifier : 'id',
      tables : {
        'holiday' : { columns : ['id', 'employee_id', 'label', 'percentage', 'dateFrom', 'dateTo'] },
        'employee' : { columns : ['name', 'postnom', 'prenom']}
      },
      join : ['holiday.employee_id=employee.id']
    }
  };

  dependencies.employees = {
    query : {
      identifier : 'id',
      tables : {
        'employee' : { columns : ['id','name', 'postnom', 'prenom']}
      }
    }
  };

  // Expose to the view
  vm.delete    = deletion;
  vm.edit      = edition;
  vm.new       = create;
  vm.save      = {};
  vm.save.edit = editSave;
  vm.save.new  = createSave;

  // Startup
  startup();

  // Functions
  function startup() {
    vm.enterprise = SessionService.enterprise;
    validate.process(dependencies)
    .then(initialize);
  }

  function initialize (models) {
    angular.extend(vm, models);
  }

  function deletion (holiday) {
    var result = confirm($translate.instant('HOLLYDAY_MANAGEMENT.CONFIRM'));
    if (result) {
      connect.delete('holiday', 'id', holiday.id)
      .then(function () {
        vm.holidays.remove(holiday.id);
        messenger.info($translate.instant('HOLLYDAY_MANAGEMENT.DELETE_SUCCESS'));
      });
    }
  }

  function edition (holiday) {
    session.action = 'edit';
    holiday.dateFrom = new Date(holiday.dateFrom);
    holiday.dateTo = new Date(holiday.dateTo);
    session.edit = angular.copy(holiday);
  }

  function create () {
    session.action = 'new';
    session.new = {};
  }

  function editSave () {
    var record = connect.clean(session.edit);
    record.dateFrom = util.sqlDate(record.dateFrom);
    record.dateTo   = util.sqlDate(record.dateTo);

    delete record.reference;
    delete record.name;
    delete record.postnom;
    delete record.prenom;
    delete record.date;

    $http.get('/getCheckHollyday/',{params : {
        'dateFrom'    : record.dateFrom,
        'dateTo'      : record.dateTo,
        'employee_id' : record.employee_id,
        'line'        : record.id
      }
    })
    .then(function(res) {
      if (res.data.length > 0 || res.data.length !== 0){
         session.action = '';
         messenger.danger($translate.instant('HOLLYDAY_MANAGEMENT.SAVE_FAILURE'), true);
         throw $translate.instant('HOLLYDAY_MANAGEMENT.SAVE_FAILURE');
      }
      return connect.put('holiday', [record], ['id']);
    })
    .then(function () {
      return validate.refresh(dependencies);
    })
    .then(function (models) {
      angular.extend(vm, models);
      session.action = '';
      session.edit = {};
      messenger.success($translate.instant('HOLLYDAY_MANAGEMENT.UPDATE_SUCCES'));
    })
    .catch(error);

  }

  function createSave () {
    var record = connect.clean(session.new);
    record.dateFrom = util.sqlDate(record.dateFrom);
    record.dateTo = util.sqlDate(record.dateTo);

    $http.get('/getCheckHollyday/',{params : {
        'dateFrom'    : record.dateFrom,
        'dateTo'      : record.dateTo,
        'employee_id' : record.employee_id,
        'line'        : ''
      }
    })
    .then(function(res) {
      if (res.data.length > 0 || res.data.length !== 0){
         session.action = '';
         messenger.danger($translate.instant('HOLLYDAY_MANAGEMENT.SAVE_FAILURE'), true);
         throw $translate.instant('HOLLYDAY_MANAGEMENT.SAVE_FAILURE');
      }
      return connect.post('holiday', [record]);
    })
    .then(function () {
      return validate.refresh(dependencies);
    })
    .then(function (models) {
      angular.extend(vm, models);
      session.action = '';
      session.new    = {};
      messenger.success($translate.instant('HOLLYDAY_MANAGEMENT.SAVE_SUCCES'));
    })
    .catch(error);

  }

  function error(err) {
    console.error(err);
  }
}

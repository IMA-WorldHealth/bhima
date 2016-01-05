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

  dependencies.hollydays = {
    query : {
      identifier : 'id',
      tables : {
        'hollyday' : { columns : ['id', 'employee_id', 'label', 'percentage', 'dateFrom', 'dateTo'] },
        'employee' : { columns : ['name', 'postnom', 'prenom']}
      },
      join : ['hollyday.employee_id=employee.id']
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

  function deletion (hollyday) {
    var result = confirm($translate.instant('HOLLYDAY_MANAGEMENT.CONFIRM'));
    if (result) {
      connect.delete('hollyday', 'id', hollyday.id)
      .then(function () {
        vm.hollydays.remove(hollyday.id);
        messenger.info($translate.instant('HOLLYDAY_MANAGEMENT.DELETE_SUCCESS'));
      });
    }
  }

  function edition (hollyday) {
    session.action = 'edit';
    hollyday.dateFrom = new Date(hollyday.dateFrom);
    hollyday.dateTo = new Date(hollyday.dateTo);
    session.edit = angular.copy(hollyday);
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
      return connect.put('hollyday', [record], ['id']);
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
      return connect.post('hollyday', [record]);
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

  function generateReference () {
    window.data = vm.hollydays.data;
    var max = Math.max.apply(Math.max, vm.hollydays.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  function error(err) {
    console.error(err);
  }
}

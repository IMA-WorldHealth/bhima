angular.module('bhima.controllers')
.controller('OffdayController', OffdayController);

OffdayController.$inject = [
  '$translate', '$http', 'validate', 'messenger', 'connect',
  'util', 'SessionService'
];

/**
  * Offday Controller
  * This controller is responsible to manage crud operations with offdays
  */
function OffdayController ($translate, $http, validate, messenger, connect, util, SessionService) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  dependencies.offdays = {
    query : {
      identifier : 'id',
      tables : {
        'offday' : {
          columns : ['id', 'label', 'date', 'percent_pay']
        }
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

  function deletion (offday) {
    var result = confirm($translate.instant('OFFDAY_MANAGEMENT.CONFIRM'));
    if (result) {
      connect.delete('offday', 'id', offday.id)
      .then(function () {
        vm.offdays.remove(offday.id);
        messenger.info($translate.instant('OFFDAY_MANAGEMENT.DELETE_SUCCESS'));
      })
      .catch(error);
    }
  }

  function edition (offday) {
    session.action = 'edit';
    offday.date = new Date(offday.date);
    session.edit = angular.copy(offday);
  }

  function create () {
    session.action = 'new';
    session.new = {};
  }

  function editSave () {
    var record = connect.clean(session.edit);
    record.date = util.sqlDate(session.edit.date);
    delete record.reference;

    $http.get('/getCheckOffday/',{
      params : {
        'date' : record.date,
        'id'   : record.id
      }
    })
    .then(function(res) {
      if(res.data.length !== 0){
        messenger.danger($translate.instant('OFFDAY_MANAGEMENT.SAVE_FAILURE'));
        throw $translate.instant('OFFDAY_MANAGEMENT.SAVE_FAILURE');
      }
      return connect.put('offday', [record], ['id']);
    })
    .then(function () {
      vm.offdays.put(record);
      session.action = '';
      session.edit = {};
      messenger.success($translate.instant('OFFDAY_MANAGEMENT.UPDATE_SUCCES'));
    })
    .catch(error);
  }

  function createSave () {
    var record = connect.clean(session.new);
    record.date = util.sqlDate(session.new.date);

    $http.get('/getCheckOffday/',{
      params : {
        'date' : record.date,
        'id'   : ''
      }
    })
    .then(function (res) {
      if (res.data.length !== 0) {
        messenger.danger($translate.instant('OFFDAY_MANAGEMENT.SAVE_FAILURE'));
        throw $translate.instant('OFFDAY_MANAGEMENT.SAVE_FAILURE');
      }
      return connect.post('offday', [record]);
    })
    .then(function (res) {
      record.id = res.data.insertId;
      record.reference = generateReference(); // this is simply to make the ui look pretty;
      vm.offdays.post(record);
      session.action = '';
      session.new = {};
      messenger.success($translate.instant('OFFDAY_MANAGEMENT.SAVE_SUCCES'));
    })
    .catch(error);
  }

  function generateReference () {
    window.data = vm.offdays.data;
    var max = Math.max.apply(Math.max, vm.offdays.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  function error(err) {
    console.error(err);
  }
}

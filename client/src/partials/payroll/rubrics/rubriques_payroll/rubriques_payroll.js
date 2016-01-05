angular.module('bhima.controllers')
.controller('RubriquePayrollController', RubriquePayrollController);

RubriquePayrollController.$inject = [
  '$translate', 'validate', 'messenger', 'connect', 'uuid', 'SessionService'
];

function RubriquePayrollController ($translate, validate, messenger, connect, uuid, SessionService) {
  var vm = this,
      dependencies = {},
      session = vm.session = {};

  dependencies.rubrics = {
    query : {
      tables : {
        'rubric' : {
          columns : ['id', 'label', 'abbr', 'is_advance', 'is_percent', 'is_discount', 'is_social_care', 'value']
        }
      }
    }
  };

  // Expose to the view
  vm.delete         = deletion;
  vm.edit           = edition;
  vm.new            = create;
  vm.save           = {};
  vm.save.edit      = editSave;
  vm.save.new       = createSave;
  vm.checkedYesOrNo = checkedYesOrNo;

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

  function deletion (rubric) {
    var result = confirm($translate.instant('RUBRIC_PAYROLL.CONFIRM'));
    if (result) {
      connect.delete('rubric', 'id', rubric.id)
      .then(function () {
        vm.rubrics.remove(rubric.id);
        messenger.info($translate.instant('RUBRIC_PAYROLL.DELETE_SUCCESS'));
      })
      .catch(error);
    }
  }

  function edition (rubric) {
    session.action = 'edit';
    session.edit = angular.copy(rubric);
  }

  function create () {
    session.action = 'new';
    session.new = {};
  }

  function editSave () {
    var rubrics = vm.rubrics.data,
        advance_exist = 0;

    rubrics.forEach(function (rub) {
      if(rub.is_advance && rub.id !== session.edit.id){
        advance_exist = 1;
      }
    });

    if(session.edit.is_advance && advance_exist){
      messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_ADVANCE'));
    } else if(session.edit.is_advance && !advance_exist  && !session.edit.is_discount){
      messenger.danger($translate.instant('RUBRIC_PAYROLL.BE_DISCOUNT'));
    } else {
      var record = connect.clean(session.edit);
      delete record.reference;
      if (record.abbr) {
        if (record.abbr.length <= 4) {
          connect.put('rubric', [record], ['id'])
          .then(function () {
            vm.rubrics.put(record);
            session.action = '';
            session.edit = {};
            messenger.success($translate.instant('RUBRIC_PAYROLL.UPDATE_SUCCES'));
          })
          .catch(error);
        } else if (record.abbr.length > 4) {
          messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_SUP4'));
        }
      } else {
        messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_EMPTY'));
      }
    }
  }

  function createSave () {
    var rubrics = vm.rubrics.data,
        advance_exist = 0;
    if(rubrics.length){
      rubrics.forEach(function (rub) {
        if(rub.is_advance){
          advance_exist = 1;
        }
      });
    }

    if(session.new.is_advance && advance_exist){
      messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_ADVANCE'));
      session.new.is_advance = null;
    } else if(session.new.is_advance && !advance_exist  && !session.new.is_discount){
      messenger.danger($translate.instant('RUBRIC_PAYROLL.BE_DISCOUNT'));
      session.new.is_advance = null;
    } else {
      var record = connect.clean(session.new);
      if (record.abbr) {
        if (record.abbr.length <= 4) {
          connect.post('rubric', [record])
          .then(function () {
            record.reference = generateReference();
            vm.rubrics.post(record);
            session.action = '';
            session.new = {};
            messenger.success($translate.instant('RUBRIC_PAYROLL.SAVE_SUCCES'));
          })
          .catch(error);
        } else if (record.abbr.length > 4) {
          messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_SUP4'));
        }
      } else {
        messenger.danger($translate.instant('RUBRIC_PAYROLL.NOT_EMPTY'));
      }
    }
  }

  function generateReference () {
    window.data = vm.rubrics.data;
    var max = Math.max.apply(Math.max, vm.rubrics.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  function checkedYesOrNo(value) {
  	if (value === 1) {return $translate.instant('RUBRIC_PAYROLL.YES');}
  	else {return $translate.instant('RUBRIC_PAYROLL.NO');}
  }

  function error(err) {
    console.error(err);
  }
}

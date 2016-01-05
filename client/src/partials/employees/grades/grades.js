angular.module('bhima.controllers')
.controller('GradeEmployeeController', GradeEmployeeController);

GradeEmployeeController.$inject = [
  '$scope', '$translate', 'validate', 'messenger', 'connect', 'uuid', 'SessionService'
];

function GradeEmployeeController ($scope, $translate, validate, messenger, connect, uuid, SessionService) {
  var dependencies = {},
      tension = {},
      session = $scope.session = {};

  dependencies.grades = {
    query : {
      identifier : 'uuid',
      tables : {
        'grade' : {
          columns : ['uuid', 'code', 'text', 'basic_salary']
        }
      }
    }
  };

  dependencies.enterprise = {
    query : {
      tables : {
        'enterprise' : {
          columns : ['currency_id']
        },
        'currency' : {
          columns : ['id', 'symbol']
        }
      },
      join : [
          'enterprise.currency_id=currency.id'
        ]
      }
  };

  // Tension salariale
  tension = {
    '1.1' : 100,
    '1.2' : 110,
    '2'   : 133,
    '3.1' : 154,
    '3.2' : 178,
    '3.3' : 206,
    '4.1' : 237,
    '4.2' : 274,
    '5'   : 317,
    '6.1' : 366,
    '6.2' : 422,
    '6.3' : 488,
    '7.1' : 564,
    '7.2' : 651,
    '7.3' : 752,
    '9'   : 1000
  };

  // Expose to the view
  $scope.delete = remove;
  $scope.edit   = edit;
  $scope.new    = create;
  $scope.save   = {};
  $scope.save.edit = saveEdit;
  $scope.save.new  = saveCreate;
  $scope.calculateBaseSalary = calculateBaseSalary;

  // Startup
  startup();

  // Functions
  function initialize (models) {
    angular.extend($scope, models);
  }

  function startup () {
    $scope.enterprise = SessionService.enterprise;
    validate.process(dependencies)
    .then(initialize);
  }

  function remove (grade) {
    var result = confirm($translate.instant('GRADE.CONFIRM'));
    if (result) {
      connect.delete('grade', grade.uuid, 'uuid')
      .then(function () {
        $scope.grades.remove(grade.uuid);
        messenger.info($translate.instant('GRADE.DELETE_SUCCESS'));
      });
    }
  }

  function edit (grade) {
    session.action = 'edit';
    session.edit = angular.copy(grade);
  }

  function create () {
    session.action = 'new';
    session.new = {};
  }

  function saveEdit () {
    var record = connect.clean(session.edit);
    delete record.reference;
    connect.put('grade', [record], ['uuid'])
    .then(function () {
      messenger.success($translate.instant('GRADE.UPDATE_SUCCES'));
      $scope.grades.put(record);
      session.action = '';
      session.edit = {};
    });
  }

  function saveCreate () {
    var record = connect.clean(session.new);
    record.uuid = uuid();
    connect.post('grade', [record])
    .then(function () {
      record.reference = generateReference();
      $scope.grades.post(record);
      session.action = '';
      session.new = {};
      messenger.success($translate.instant('GRADE.SAVE_SUCCES'));
    })
    .catch(error);
  }

  function generateReference () {
    window.data = $scope.grades.data;
    var max = Math.max.apply(Math.max, $scope.grades.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  function calculateBaseSalary () {
    var salary,
        base = 33; // The Base Salary
    if (session.new) {
      salary = session.new.text && tension[session.new.text] ? (tension[session.new.text] * base) / 100 : 0;
      session.new.basic_salary = salary;
    }

    if (session.edit) {
      salary = session.edit.text && tension[session.edit.text] ? (tension[session.edit.text] * base) / 100 : 0;
      session.edit.basic_salary = salary;
    }
  }

  function error(err) {
    console.error(err);
  }
}

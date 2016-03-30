angular.module('bhima.controllers')
.controller('reportEmployeeStanding', ReportEmployeeStanding);

ReportEmployeeStanding.$inject = [
  '$scope', '$window', 'validate', 'messenger', 'connect', 'SessionService'
];

function ReportEmployeeStanding ($scope, $window, validate, messenger, connect, SessionService) {
  var dependencies = {},
      session = $scope.session = {},
      state = $scope.state;

  dependencies.employees = {
    required : true,
    query : {
      tables : {
        employee : {columns : ['id', 'code', 'prenom', 'name', 'postnom', 'sexe', 'dob', 'location_id','creditor_uuid','debitor_uuid']},
        creditor : { columns : ['text']},
        creditor_group : { columns : ['account_id', 'uuid']}
      },
      join : ['employee.creditor_uuid=creditor.uuid', 'creditor.group_uuid=creditor_group.uuid']
    }
  };

  dependencies.accounts = {
    required : true,
    query : {
      tables : {
        account : {
          columns : ['id', 'label', 'number']
        }
      }
    }
  };

  // Initialize models
  $scope.img = 'placeholder.gif';
  session.isSearched = false;
  session.noRecord   = false;

  // Expose to the view
  $scope.search        = search;
  $scope.reconfigure   = reconfigure;
  $scope.formatPatient = formatPatient;
  $scope.isOutstanding = isOutstanding;
  $scope.print = function () { print(); };

  // Startup
  startup();

  // Functions
  function formatPatient(employee) {
    return employee ? [employee.prenom, employee.name].join(' ') : '';
  }

  function isOutstanding(receipt) {
    return receipt.debit - receipt.credit !== 0;
  }

  function startup () {
    $scope.project = SessionService.project;
    validate.process(dependencies)
    .then(processModels, handleErrors);
  }

  function reconfigure () {
    $scope.state = null;
    session.selected = null;
  }

  function processModels(models) {
    angular.extend(session, models);
    session.date = new Date();
  }

  function handleErrors(err) {
    messenger.danger('An error occured:' + JSON.stringify(err));
  }

  function search() {
    session.employee = session.selected;
    var id = session.employee.creditor_uuid;
    connect.fetch('/reports/employeeStandingV2/?id=' + id)
    .then(function (data) {
      session.receipts = data || [];
      session.somDebit  = 0;
      session.somCredit = 0;
      session.solde     = 0;

      session.receipts.forEach(function (receipt) {
        session.somDebit  += receipt.debit;
        session.somCredit += receipt.credit;
      });
      
      session.somDebit = Number(session.somDebit).toFixed(2);
      session.somCredit = Number(session.somCredit).toFixed(2);
      session.solde = session.somDebit - session.somCredit;
      $scope.state = 'generate';
    })
    .catch(function (err) {
      messenger.danger('An error occured:' + JSON.stringify(err));
    });
  }

}

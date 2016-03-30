angular.module('bhima.controllers')
.controller('reportPatientStanding', [
  '$scope',
  '$window',
  'validate',
  'appstate',
  'messenger',
  'connect',
  function ($scope, $window, validate, appstate, messenger, connect) {
    var dependencies = {};
    $scope.img = 'placeholder.gif';
    var session = $scope.session = {},
      state = $scope.state;
    session.isSearched = false;
    session.noRecord = false;

    dependencies.patients = {
      required : true,
      query : {
        tables : {
          patient : {columns : ['uuid', 'project_id', 'reference', 'debitor_uuid', 'first_name', 'last_name', 'middle_name', 'sex', 'dob', 'origin_location_id', 'registration_date']},
          debitor : { columns : ['text']},
          debitor_group : { columns : ['account_id', 'price_list_uuid', 'is_convention']},
          project : { columns : ['abbr']}
        },
        join : ['patient.debitor_uuid=debitor.uuid', 'debitor.group_uuid=debitor_group.uuid', 'patient.project_id=project.id']
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

    $scope.formatPatient = function (patient) {
      return patient ? [patient.first_name, patient.last_name, patient.middle_name].join(' ') : '';
    };

    function processModels(models) {
      angular.extend(session, models);
      session.date = new Date();
    }

    function handleErrors(err) {
      messenger.danger('An error occured:' + JSON.stringify(err));
    }

    function search() {
      $scope.state = 'generate';
      session.patient = session.selected;
      var id = session.patient.debitor_uuid,
        account_id = session.patient.account_id;

      connect.fetch('/reports/patientStanding/?id=' + id + '&account_id=' + account_id)
      .then(function (data) {

        session.receipts = data.receipts || [];
        session.patient.last_payment_date = new Date(data.last_payment_date);
        session.patient.last_purchase_date = new Date(data.last_purchase_date);

        var balance = 0,
            sumDue = 0,
            sumBilled = 0;

        session.receipts.forEach(function (receipt) {
          if (receipt.debit - receipt.credit !== 0){
            receipt.billed = receipt.debit;
            receipt.due = receipt.debit - receipt.credit;
            balance += receipt.debit - receipt.credit;
            sumBilled += receipt.billed;
            sumDue += receipt.due;
          }          
        });

        session.patient.total_amount = sumBilled;
        session.patient.total_due = sumDue;
        session.patient.account_balance = balance;
        session.isSearched = true;
        session.noRecord = session.isSearched && !session.receipts.length;

      })
      .catch(function (err) {
        messenger.danger('An error occured:' + JSON.stringify(err));
      });
    }

    $scope.isOutstanding = function isoutstanding(receipt) {
      return receipt.debit - receipt.credit !== 0;
    };

    appstate.register('project', function (project) {
      $scope.project = project;

      validate.process(dependencies)
      .then(processModels, handleErrors);
    });

    function reconfigure () {
      $scope.state = null;
      session.selected = null;
    }

    function print () { $window.print(); }
    $scope.search = search;
    $scope.print = print;
    $scope.reconfigure = reconfigure;

  }
]);

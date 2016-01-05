angular.module('bhima.controllers')
.controller('primary_cash.payday_advance', [
  '$scope',
  '$routeParams',
  '$translate',
  '$location',
  '$http',
  'messenger',
  'validate',
  'appstate',
  'appcache',
  'connect',
  'util',
  'exchange',
  '$q',
  'uuid',
  'SessionService',
  function ($scope, $routeParams, $translate, $location, $http, messenger, validate, appstate, Appcache, connect, util, exchange, $q, uuid, Session) {
    var dependencies = {},
        session = $scope.session = {},
        cache = new Appcache('salary_advance');

    session.primaryCashBox = $routeParams.cashbox;

    dependencies.cashBox = {
      required : true,
      query : {
        tables : {
          'cash_box_account_currency' : {
            columns : ['id::cash_box_account_currency_id', 'currency_id', 'account_id']
          },
          'currency' : {
            columns : ['symbol', 'min_monentary_unit']
          },
          'cash_box' : {
            columns : ['id', 'text', 'project_id']
          },
          'account' : {
            columns : ['account_txt']
          }
        },
        join : [
          'cash_box_account_currency.currency_id=currency.id',
          'cash_box_account_currency.cash_box_id=cash_box.id',
          'account.id=cash_box_account_currency.account_id'
        ],
        where : ['cash_box.id=' + session.primaryCashBox]
      }
    };

    dependencies.paymentPeriod = {
      query : {
        tables : {
          'paiement_period' : {
            columns : ['id', 'config_tax_id', 'config_rubric_id', 'label', 'dateFrom', 'dateTo']
          }
        }
      }
    };

    dependencies.employee = {
      query : {
        tables : {
          'employee' : { columns : ['id', 'code', 'prenom', 'name', 'postnom', 'creditor_uuid'] }
        }
      }
    };

    function init (models) {
      angular.extend($scope, models);
      session.hasDailyRate = exchange.hasDailyRate();
      if (!session.hasDailyRate) { messenger.info($translate.instant('UTIL.CHECK_DAILY_RATE'), true); }
    }

    appstate.register('project', function (project) {
      $scope.project = project;
      validate.process(dependencies)
      .then(init);
    });

    function setCashAccount(cashAccount) {
      if (cashAccount) {
        session.selectedItem = cashAccount;
        cache.put('selectedItem', cashAccount);
      }
    }

    function formatEmployee (employee) {
      return employee.prenom + ', ' + employee.name + ' - ' + employee.postnom;
    }

    function getEmployee (employee) {
      session.employee = formatEmployee(employee);
      session.creditor_uuid = employee.creditor_uuid;
    }

    function submit () {
      if (session.selectedItem && session.creditor_uuid && session.montant && session.motif) {
        var document_uuid = uuid();

        var primary = {
          uuid          : uuid(),
          project_id    : $scope.project.id,
          type          : 'S',
          date          : util.sqlDate(new Date()),
          deb_cred_uuid : session.creditor_uuid,
          deb_cred_type : 'C',
          account_id    : session.selectedItem.account_id,
          currency_id   : session.selectedItem.currency_id,
          cost          : session.montant,
          user_id       : Session.user.id,
          description   : session.motif,
          cash_box_id   : session.selectedItem.id,
          origin_id     : 9 //FIX ME : Find a way to generate it automatically
        };

        var primary_details = {
          uuid              : uuid(),
          primary_cash_uuid : primary.uuid,
          debit             : 0,
          credit            : primary.cost,
          inv_po_id         : null, // uuid de l'avance
          document_uuid     : document_uuid
        };

        var packet = {
          primary : primary,
          primary_details : primary_details
        };


        if (session.hasDailyRate) {

          connect.post('primary_cash', [packet.primary], ['uuid'])
          .then(function () {
            return connect.post('primary_cash_item', [packet.primary_details], ['uuid']);
          })
          .then(function () {
            return connect.fetch('/journal/salary_advance/' + packet.primary.uuid);
          })
          .then(function () {
            session.employee = null;
            session.creditor_uuid = null;
            session.selectedItem = null;
            session.montant = null;
            session.motif = null;
            $location.path('/invoice/salary_advance/' + packet.primary.uuid);
          })
          .catch(function (err) { console.log(err); });

        } else {
          messenger.info($translate.instant('UTIL.CHECK_DAILY_RATE'), true);
        }
      }

    }

    $scope.setCashAccount = setCashAccount;
    $scope.formatEmployee = formatEmployee;
    $scope.getEmployee = getEmployee;
    $scope.submit = submit;

  }
]);

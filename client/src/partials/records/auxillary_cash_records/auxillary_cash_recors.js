angular.module('bhima.controllers')
.controller('auxillaryRecords', [
  '$scope',
  '$timeout',
  'util',
  'validate',
  'connect',
  'exchange',
  '$translate',
  function ($scope, $timeout, util, validate, connect, exchange, $translate) {
    // TODO add search (filter)
    // TODO add sortable (clickable) columns
    var dependencies = {};

    var period = $scope.period = [
      {
        key : 'CASH_PAYMENTS.DAY',
        method : today
      },
      {
        key : 'CASH_PAYMENTS.WEEK',
        method : week
      },
      {
        key : 'CASH_PAYMENTS.MONTH',
        method : month
      }
    ];

    var session = $scope.session = {
      param : {},
      searching : true
    };

    var total = $scope.total = {
      method : {
        'cash' : totalCash,
        'patients' : totalPatients,
        'cost' : totalCost
      },
      result : {}
    };

    dependencies.cash = {};
    dependencies.project = {
      query : {
        tables : {
          project : {
            columns : ['id', 'abbr', 'name']
          }
        }
      }
    };

    dependencies.currencies = {
      required : true,
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    dependencies.cash_user = {
      query : {
        tables : {
          'cash' : { columns : ['user_id'] },
          'user' : {columns : ['id', 'first', 'last'] }
        },
        distinct : true,
        join : ['cash.user_id=user.id']
      }
    };

    $timeout(init, 100);

    function init() {
      validate.process(dependencies, ['project', 'currencies', 'cash_user']).then(loadProjects);
    }

    function loadProjects(model) {
      $scope.model = model;
      // TODO Determine best way to wait for page load before requesting data
      select(period[0]);
    }

    function select(period) {
      session.selected = period;
      period.method();
    }

    function updateSession(model) {
      $scope.model = model;
      session.currency = model.currencies.data[0].id;
      convert();
      updateTotals();
      session.searching = false;
      receiptLocation();
    }

    function receiptLocation () {
      $scope.model.cash.data.forEach(function (item) {
        item.receiptLocation = item.is_caution === 1 ? 'caution' : 'cash';
      });
    }

    $scope.format = function format(user) {
      return [user.first, user.last].join(' - ');
    };

    function reset() {
      var request;
      request = {
        dateFrom : util.sqlDate(session.param.dateFrom),
        dateTo : util.sqlDate(session.param.dateTo),
      };

      if (!isNaN(Number(session.project))) {
        request.project = session.project;
      }

      if (!isNaN(Number(session.user))) {
        dependencies.user = {
          query : {
            tables : {
              'user' : {columns : ['id', 'first', 'last'] }
            },
             where : [
              'user.id=' + session.user
            ]
          }
        };
        validate.process(dependencies, ['user'])
        .then(function (model) {
          var userData = model.user.data[0];
          $scope.userSelected = userData.first + ' - ' + userData.last;
        });
        request.user = session.user;
      } else {
        $scope.userSelected = $translate.instant('AUXILLARY_CASH_RECORD.ALL_USERS');
      }


      session.searching = true;
      dependencies.cash.query = '/reports/cashAuxillaryRecords/?' + JSON.stringify(request);
      total.result = {};

      if ($scope.model.cash) {
        $scope.model.cash.data = [];
      }
      validate.refresh(dependencies, ['cash']).then(updateSession);
    }

    function today() {
      $scope.session.param.dateFrom = new Date();
      $scope.session.param.dateTo = new Date();
      reset();
    }

    function week() {
      $scope.session.param.dateFrom = new Date();
      $scope.session.param.dateTo = new Date();
      $scope.session.param.dateFrom.setDate($scope.session.param.dateTo.getDate() - $scope.session.param.dateTo.getDay());

      reset();
    }

    function month() {
      $scope.session.param.dateFrom = new Date();
      $scope.session.param.dateTo = new Date();
      $scope.session.param.dateFrom.setDate(1);
      reset();
    }

    function updateTotals() {
      for (var key in total.method) {
        total.result[key] = total.method[key]();
      }
    }

    function totalCash() {
      return $scope.model.cash.data.length;
    }

    function totalPatients() {
      var total = 0, evaluated = {};

      $scope.model.cash.data.forEach(function (cash) {
        if (evaluated[cash.deb_cred_uuid]) { return; }
        total++;
        evaluated[cash.deb_cred_uuid] = true;
      });

      return total;
    }

    function totalCost() {
      return $scope.model.cash.data.reduce(function (a, b) {
        return a + b.cost;
      }, 0);
    }

    function convert (){
      session.sum = 0;
      if($scope.model.cash.data) {
        $scope.model.cash.data.forEach(function (cash) {
          if(!cash.cashDiscardId){
            session.sum += exchange.convertir(cash.cost, cash.currency_id, session.currency, new Date());
          }
        });
      }
    }
    $scope.convert = convert;
    $scope.select = select;
    $scope.reset = reset;
  }
]);

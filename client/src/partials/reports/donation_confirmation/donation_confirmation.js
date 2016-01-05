angular.module('bhima.controllers')
.controller('donation_confirmation', [
  '$scope',
  '$timeout',
  '$translate',
  'connect',
  'appstate',
  'validate',
  'exchange',
  function ($scope, $timeout, $translate, connect, appstate, validate, exchange) {
    var session = $scope.session = {},
      state = $scope.state,
      allTypes = $scope.allTypes = '0,1';

    $scope.selected = null;

    var dependencies = {};

    dependencies.projects = {
      required: true,
      query : {
        tables : {
          'project' : {
            columns : ['id', 'abbr', 'name']
          }
        }
      }
    };

    function day () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
    }

    function week () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      session.dateFrom.setDate(session.dateTo.getDate() - session.dateTo.getDay());
    }

    function month () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      session.dateFrom.setDate(1);
    }


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

    $scope.options = [
      {
        label : 'CASH_PAYMENTS.DAY',
        fn : day,
      },
      {
        label : 'CASH_PAYMENTS.WEEK',
        fn : week,
      },
      {
        label : 'CASH_PAYMENTS.MONTH',
        fn : month
      }
    ];

    function search (selection) {
      session.selected = selection.label;
      selection.fn();
    }

    function reset (p) {
      session.searching = true;
      var req, url;

      $scope.state = 'generate';
      // toggle off active
      session.active = !p;

      req = {
        dateFrom : session.dateFrom,
        dateTo : session.dateTo
      };

      url = '/reports/donation_confirmation/?start=%start%&end=%end%'
      .replace('%start%', req.dateFrom)
      .replace('%end%', req.dateTo);

      connect.fetch(url)
      .then(function (model) {
        if (!model) { return; }
        $scope.donation_records = model;
      });

    }

    appstate.register('project', function (project) {
      session.project = project.id;
      validate.process(dependencies)
      .then(function (models) {
        $scope.projects = models.projects;
        $scope.currencies = models.currencies;
        $scope.projectAbbr = session.project.abbr;
        session.currency = $scope.currencies.data[0].id;
        $scope.allProjectIds =
          models.projects.data.reduce(function (a,b) { return a + ',' + b.id ; }, '')
          .substr(1);
        search($scope.options[0]);
      });
    });

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
    });

    $scope.print = function print() {
      window.print();
    };

   function reconfigure () {
      $scope.state = null;
      $scope.session.type = null;
    }

    $scope.search = search;
    $scope.reset = reset;
    $scope.reconfigure = reconfigure;
  }
]);

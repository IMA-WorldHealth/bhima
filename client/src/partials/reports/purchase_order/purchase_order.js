angular.module('bhima.controllers')
.controller('purchase_order', [
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
      allTypes = $scope.allTypes = '0,1',
      service_txt = 'confirm_purchase';

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

    dependencies.transaction_type = {
      query : {
        tables : {
          'transaction_type' : {
            columns : ['id']
          }
        },
        where : ['transaction_type.service_txt=' + service_txt]
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
      $scope.typePurchase = '';

      if(session.type === '1'){
        $scope.typePurchase = $translate.instant('COLUMNS.DIRECT');
      } else if(session.type === '0'){
        $scope.typePurchase = $translate.instant('COLUMNS.INDIRECT');
      } 
      var req, url;
      
      $scope.state = 'generate';
      // toggle off active
      session.active = !p;

      req = {
        dateFrom : session.dateFrom,
        dateTo : session.dateTo
      };

      url = '/reports/purchase_records/?id=%types%&start=%start%&end=%end%&transaction=%transaction%'
      .replace('%types%', session.type)
      .replace('%start%', req.dateFrom)
      .replace('%end%', req.dateTo)
      .replace('%transaction%', $scope.transaction) ;

      connect.fetch(url)
      .then(function (model) {
        if (!model) { return; }
        $scope.purchase_records = model;
      });

    }

    appstate.register('project', function (project) {
      session.project = project.id;
      validate.process(dependencies)
      .then(function (models) {
        $scope.transaction = models.transaction_type.data[0].id;        
        $scope.projects = models.projects;
        $scope.currencies = models.currencies;
        $scope.projectAbbr = $scope.projects.data[0].abbr;
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

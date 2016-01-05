angular.module('bhima.controllers')
.controller('payroll_report', [
  '$scope',
  '$translate',
  '$http',
  '$routeParams',
  'connect',  
  'validate',
  'appstate',
  'util',
  function ($scope, $translate, $http, $routeParams, connect, validate, appstate, util) {
    var dependencies = {},
        session = $scope.session = {},
        state = $scope.state;

   dependencies.getPeriods = {
      query : {
        identifier : 'id',
        tables : {
          'paiement_period' : { 
            columns : ['id', 'label', 'dateFrom', 'dateTo']
          }
        }
      }
    };

    function reset () {
      var record = connect.clean(session);
      dependencies.periods = {
        query : {
          identifier : 'id',
          tables : {
            'paiement_period' : { 
              columns : ['id', 'label', 'dateFrom', 'dateTo']
            }
          },
          where : ['paiement_period.id=' + record.period_id]
        }
      };
      validate.process(dependencies, ['periods'])
      .then(function (model) {
        var period = $scope.period =model.periods.data[0];
      });
      

      $http.get('/getReportPayroll/',{params : {
            'period_id' : record.period_id
          }  
      }).
      success(function(data) {
        $scope.Reports = data;
      });
      $scope.state = 'generate';
    }

    $scope.print = function print() {
      window.print();
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      validate.process(dependencies)
      .then(startup);
    });

   function reconfigure () {
      $scope.state = null;
      session.period_id = null;
    }

    $scope.reset = reset;
    $scope.reconfigure = reconfigure;
  } 
]);


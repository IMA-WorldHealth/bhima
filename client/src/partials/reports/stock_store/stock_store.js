angular.module('bhima.controllers')
.controller('stock_store', [
  '$scope',
  '$timeout',
  '$routeParams',
  '$q',
  'util',
  'validate',
  'connect',
  function ($scope, $timeout, $routeParams, $q, util, validate, connect) {
    var dependencies = {};
    $scope.model     = {};
    $scope.timestamp = new Date();

    var session = $scope.session = {
      param     : {},
      searching : true,
      loading   : false
    };

    var total = $scope.total = {
      method : {
        'totalItems' : totalItems
      },
      result : {}
    };

    var depotId = $routeParams.depotId;

    dependencies.consumption = {};
    dependencies.project = {
      query : {
        tables : {
          project : {
            columns : ['id', 'abbr', 'name']
          }
        }
      }
    };

    // Expose to the view
    $scope.print = function() { print(); };

    // Startup
    startup();

    function updateSession(model) {
      $scope.model = model;
      $scope.uncompletedList = model;
      var consumption = model.consumption.data;
      var dbPromises = consumption.map(function (cons) {
        return connect.fetch('/reports/stockComplete/?tracking_number=' + cons.tracking_number + '&depot_uuid=' + depotId)
        .then(function (data) {
          cons.current -= data[0].consumed;
        })
        .catch(error);
      });

      $q.all(dbPromises)
      .then(updateTotals)
      .then(endLoading)
      .catch(error);
      
    }

    function endLoading() {
      session.searching = false;
      session.loading   = false;
    }

    function startup() {
      var request = { depotId : depotId };

      session.loading = true;

      dependencies.store = {
        required: true,
        query : {
          tables : {
            'depot' : {
              columns : ['uuid', 'text', 'reference', 'enterprise_id']
            }
          },
          where : ['depot.uuid=' + depotId]
        }
      };
      validate.process(dependencies, ['store'])
      .then(function (model) {
        var dataDepot = model.store.data[0];
        $scope.depotSelected = dataDepot.text;
      })
      .catch(error);

      session.searching = true;
      total.result = {};
      dependencies.consumption.query = '/reports/stockStore/?' + JSON.stringify(request);

      if ($scope.model.consumption) {
        $scope.model.consumption.data = [];
      }
      validate.refresh(dependencies, ['consumption'])
      .then(updateSession)
      .catch(error);
    }

    function updateTotals() {
      for (var key in total.method) {
        total.result[key] = total.method[key]();
      }
    }

    function totalItems() {
      return $scope.model.consumption.data.length;
    }

    function error(err) {
      console.error(err);
    }

  }
]);

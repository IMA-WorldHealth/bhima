angular.module('bhima.controllers')
.controller('stock_movement', [
  '$scope',
  '$q',
  '$translate',
  'connect',
  'appstate',
  'validate',
  'messenger',
  'util',
  function ($scope, $q, $translate, connect, appstate, validate, messenger, util) {
    var session = $scope.session = {};
    var dependencies = {},
      state = $scope.state;

    session.dateFrom = new Date();
    session.dateTo = new Date();

    $scope.options = [
      {
        label : 'EXPIRING.DAY',
        fn : day,
      },
      {
        label : 'EXPIRING.WEEK',
        fn : week,
      },
      {
        label : 'EXPIRING.MONTH',
        fn : month
      }
    ];

    $scope.selected = null;

    dependencies.depots = {
      required: true,
      query : {
        tables : {
          'depot' : {
            columns : ['uuid', 'text', 'reference', 'enterprise_id']
          }
        }
      }
    };


    function search (selection) {
      session.selected = selection.label;
      selection.fn();
    }

    function day () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      $scope.configuration = getConfiguration();
    }

    function week () {
      session.dateFrom = new Date();
      session.dateFrom.setDate(session.dateFrom.getDate() - session.dateFrom.getDay());
      session.dateTo = new Date(session.dateFrom.getTime()+(6*3600000));
      $scope.configuration = getConfiguration();
    }

    function month () {
      session.dateFrom = new Date();
      session.dateTo = new Date();
      session.dateFrom.setDate(1);
      $scope.configuration = getConfiguration();
    }

    function doSearching (p) {
      if(session.depot_from === '*'){
        $scope.depotFromSelected = $translate.instant('DEPOT.ALL');
      } else {
        
        dependencies.store = {
          required: true,
          query : {
            tables : {
              'depot' : {
                columns : ['uuid', 'text', 'reference', 'enterprise_id']
              }
            },
            where : ['depot.uuid=' + session.depot_from]
          }
        };
        validate.process(dependencies, ['store'])
        .then(function (model) {
          var dataDepot = model.store.data[0];
          $scope.depotFromSelected = dataDepot.text;
        });       
      }

      if(session.depot_to === '*'){
        $scope.depotToSelected = $translate.instant('DEPOT.ALL');
      } else {
        
        dependencies.store = {
          required: true,
          query : {
            tables : {
              'depot' : {
                columns : ['uuid', 'text', 'reference', 'enterprise_id']
              }
            },
            where : ['depot.uuid=' + session.depot_to]
          }
        };
        validate.process(dependencies, ['store'])
        .then(function (model) {
          var dataDepot = model.store.data[0];
          $scope.depotToSelected = dataDepot.text;
        });       
      }


      $scope.state = 'generate';
      if (p && p===1) {
        $scope.configuration = getConfiguration();
      }

      var dateFrom = util.sqlDate($scope.configuration.df),
          dateTo = util.sqlDate($scope.configuration.dt);

      var url = '/reports/stock_movement/?depot_from=' + session.depot_from +
        '&depot_to=' + session.depot_to + 
        '&datef=' + util.sqlDate(session.dateFrom) + 
        '&datet=' + util.sqlDate(session.dateTo);

      connect.fetch(url)
      .then(complete)
      .catch(function (err) {
        messenger.danger(err);
      });
    }

    function complete (models) {
      $scope.movement = models;
/*      $scope.uncompletedList = models;
      return $q.all(models.map(function (m) {
        return connect.fetch('expiring_complete/'+m.tracking_number+'/'+$scope.configuration.depot_uuid);
      }));*/
    }

    function cleanEnterpriseList () {
      return $scope.uncompletedList.map(function (item) {
        return {
          tracking_number  : item.tracking_number,
          lot_number       : item.lot_number,
          text             : item.text,
          expiration_date  : item.expiration_date,
          initial          : item.initial,
          current          : item.initial - item.consumed
        };
      });
    }

    function cleanDepotList () {
      return $scope.uncompletedList.map(function (item) {
        return {
          tracking_number : item.tracking_number,
          lot_number      : item.lot_number,
          text            : item.text,
          expiration_date : item.expiration_date,
          initial         : item.initial,
          current         : item.current - item.consumed
        };
      });

    }

    function init (model) {
      $scope.model = model;
      session.depot_from = '*';
      session.depot_to = '*';
      search($scope.options[0]);
      $scope.configuration = getConfiguration();
    }

    function getConfiguration () {
      return {
        depot_uuid : session.depot,
        df         : session.dateFrom,
        dt         : session.dateTo
      };
    }

    $scope.print = function print() {
      window.print();
    };

   function reconfigure () {
      $scope.state = null;
      $scope.configuration.depot_uuid = null;
    }

    appstate.register('enterprise', function(enterprise) {
      $scope.enterprise = enterprise;
      dependencies.depots.where =
        ['depots.enterprise_id=' + enterprise.id];
      validate.process(dependencies)
      .then(init);
    });

    $scope.search = search;
    $scope.doSearching = doSearching;
    $scope.reconfigure = reconfigure;
  }
]);

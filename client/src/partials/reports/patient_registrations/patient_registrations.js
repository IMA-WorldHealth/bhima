angular.module('bhima.controllers')
.controller('reportPatientRegistrations', [
  '$scope',
  '$filter',
  '$translate',
  'validate',
  'connect',
  'appstate',
  function ($scope, $filter, $translate, validate, connect, appstate) {
    var session = $scope.session = { count : {} },
        dependencies = {},
        state = $scope.state,
        allProjectIds = $scope.allProjectIds = '';

    $scope.selected = null;

    dependencies.projects = {
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

    $scope.options = [
      {
        label : 'CASH_PAYMENTS.DAY',
        fn : day
      },
      {
        label : 'CASH_PAYMENTS.WEEK',
        fn : week
      },
      {
        label : 'CASH_PAYMENTS.MONTH',
        fn : month
      }
    ];

    function search (selection) {
      session.selected = selection;
      selection.fn();
    }

    function reset (p) {
      var req, url,
        projectSelected = $scope.projectSelected,
        selected = $scope.selected = (session.project === $scope.allProjectIds) ? $translate.instant('CASH_PAYMENTS.ALL_PROJECTS') : 'selected';

      if(selected === 'selected'){
        dependencies.project = {
          required: true,
          query : {
            tables : {
              'project' : {
                columns : ['id', 'abbr', 'name']
              }
            },
            where : ['project.id=' + session.project]
          }
        };  
        validate.process(dependencies, ['project'])
        .then(function (model) {
          var dataproject = model.project.data[0];
          $scope.projectSelected = dataproject.name;
        });      
      } else {
        $scope.projectSelected = selected;
      }
 
      session.searching = true;

      // toggle off active
      session.active = !p;

      req = {
        dateFrom : $filter('date')(session.dateFrom, 'yyyy-MM-dd'),
        dateTo : $filter('date')(session.dateTo, 'yyyy-MM-dd')
      };

      url = '/reports/patients/?id=' + session.project;
      url += '&start=' + req.dateFrom;
      url += '&end=' + req.dateTo;

      connect.fetch(url)
      .then(function (model) {
        $scope.patients = model;
        session.searching = false;
      });
    }

    appstate.register('project', function (project) {
      $scope.project = project;
      validate.process(dependencies)
      .then(function (models) {
        $scope.projects = models.projects;
        $scope.allProjectIds =
          models.projects.data.reduce(function (a,b) { return a + ',' + b.id ; }, '')
          .substr(1);
        $scope.projects.post({
          id : $scope.allProjectIds,
          name : $translate.instant('CASH_PAYMENTS.ALL_PROJECTS')
        });
        session.project = project.id;
        search($scope.options[0]);
      });
    });

    $scope.$watch('patients', function () {
      if (!$scope.patients) { return; }
      session.count.male = 0;
      session.count.female = 0;
      $scope.patients.forEach(function (p) {
        session.count[p.sex === 'M' ? 'male' : 'female' ] += 1;
      });
    });

    function generate() {
      reset();
      $scope.state = 'generate';
    }

    function reconfigure() {
      $scope.state = null;
    }

    function printReport() {
      print();
    }

    $scope.search = search;
    $scope.reset = reset;
    $scope.generate = generate;
    $scope.reconfigure = reconfigure;
    $scope.printReport = printReport;
  }
]);

angular.module('bhima.controllers')
.controller('ReportPatientVisitStatus', ReportPatientVisitStatus);

ReportPatientVisitStatus.$inject = [
  '$scope', '$filter', '$translate', 'validate', 'connect', 'SessionService', 'util'
];

function ReportPatientVisitStatus ($scope, $filter, $translate, validate, connect, SessionService, util) {
  var session = $scope.session = { count : {} },
      dependencies = {},
      state = $scope.state,
      allProjectIds = $scope.allProjectIds = '';

  $scope.selected = null;
  session.details = false;

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

  // Expose to the view
  $scope.patientsNewVisit = [];
  $scope.patientsOldVisit = [];
  $scope.search           = search;
  $scope.reset            = reset;
  $scope.generate         = generate;
  $scope.reconfigure      = reconfigure;
  $scope.printReport      = printReport;
  $scope.showDetails      = showDetails;
  $scope.chartGroupBy     = chartGroupBy;

  // Watchers
  $scope.$watch('patientsNewVisit', function () {
    if (!$scope.patientsNewVisit) { return; }
    else {
      session.count.maleNew = 0;
      session.count.femaleNew = 0;
      $scope.patientsNewVisit.forEach(function (p) {
        session.count[p.sex === 'M' ? 'maleNew' : 'femaleNew' ] += 1;
      });
    }
  });

  $scope.$watch('patientsOldVisit', function () {
    if (!$scope.patientsOldVisit) { return; }
    else {
      session.count.maleOld = 0;
      session.count.femaleOld = 0;
      $scope.patientsOldVisit.forEach(function (p) {
        session.count[p.sex === 'M' ? 'maleOld' : 'femaleOld' ] += 1;
      });
    }
  });

  // Startup
  startup();

  // Functions
  function startup() {
    $scope.project = SessionService.project;
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
      session.project = $scope.project.id;
      search($scope.options[0]);
    });
  }

  function search (selection) {
    session.selected = selection;
    selection.fn();
  }

  function showDetails () {
    session.details = session.details ? false : true;
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

    getNewVisit()
    .then(getOldVisit)
    .then(handleModel)
    .then(chartGroupBy)
    .catch(error);

    function getNewVisit() {
      url = '/reports/patients_new_visit/?id=' + session.project;
      url += '&start=' + req.dateFrom;
      url += '&end=' + req.dateTo;
      return connect.fetch(url);
    }

    function getOldVisit(model) {
      $scope.patientsNewVisit = model;
      url = '/reports/patients_old_visit/?id=' + session.project;
      url += '&start=' + req.dateFrom;
      url += '&end=' + req.dateTo;
      return connect.fetch(url);
    }

    function handleModel(model) {
      $scope.patientsOldVisit = model;
      session.searching = false;
    }

  }

  function error(err) {
    console.error(err);
  }

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

  function ChartRender(type) {
    /* global Chart */
    // FIXME: Need optimizations

    var ctxBar = document.getElementById('BarChart').getContext('2d'),
        ctxLine = document.getElementById('LineChart').getContext('2d');

    var i, j, countNew, countOld;

    // Array of date
    var newVisitDate = $scope.patientsNewVisit.map(function (p) {
      return util.htmlDate(p.date);
    });

    // Array of months
    var newVisitMonth = $scope.patientsNewVisit.map(function (p) {
      var d = new Date(util.htmlDate(p.date));
      return { month : d.getMonth() + 1, year : d.getYear() + 1900 };
    });

    // Sort the array of dates
    newVisitDate.sort(function (a, b) {
      var prev = new Date(a),
          curr = new Date(b);
      if (prev < curr) { return -1; }
      if (prev > curr) { return 1; }
      return 0;
    });

    // Sort the array of dates
    newVisitMonth.sort(function (a, b) {
      var prev = new Date('"' + a.year + '-' + a.month + '"'),
          curr = new Date('"' + b.year + '-' + b.month + '"');
          if (prev < curr) { return -1; }
          if (prev > curr) { return 1; }
      return 0;
    });
    // flatten
    newVisitMonth = newVisitMonth.map(function (elem) {
      return '' + elem.year + '-' + elem.month;
    });

    // Unique Date for Chart
    newVisitDate = newVisitDate.filter(function (element, index, arr) {
      return arr.indexOf(element) === index;
    });

    // Unique month for Chart
    newVisitMonth = newVisitMonth.filter(function (element, index, arr) {
      return arr.indexOf(element) === index;
    });

    // Grouping by date
    var dataNew = [];
    var dataOld = [];
    for(i=0; i<newVisitDate.length; i++) {
      countNew = 0; countOld = 0;
      // New Visit
      for (j = 0; j < $scope.patientsNewVisit.length; j++) {
        if (util.htmlDate($scope.patientsNewVisit[j].date) == newVisitDate[i]) {
          countNew++;
        }
      }

      // Old Visit
      for (j = 0; j < $scope.patientsOldVisit.length; j++) {
        if (util.htmlDate($scope.patientsOldVisit[j].date) === newVisitDate[i]) {
          countOld++;
        }
      }

      // Getting Data
      dataNew.push(countNew);
      dataOld.push(countOld);
    }

    // Grouping by month
    var monthNew = [];
    var monthOld = [];
    for(i=0; i<newVisitMonth.length; i++) {
      countNew = 0; countOld = 0;
      var d, p;

      p = new Date(newVisitMonth[i]);
      // New Visit
      for (j = 0; j < $scope.patientsNewVisit.length; j++) {
        d = new Date(util.htmlDate($scope.patientsNewVisit[j].date));
        if (d.getMonth() === p.getMonth() && d.getYear() === p.getYear()) {
          countNew++;
        }
      }

      // Old Visit
      for (j = 0; j < $scope.patientsOldVisit.length; j++) {
        d = new Date(util.htmlDate($scope.patientsOldVisit[j].date));
        if (d.getMonth() === p.getMonth() && d.getYear() === p.getYear()) {
          countOld++;
        }
      }

      // Getting Data
      monthNew.push(countNew);
      monthOld.push(countOld);
    }
    // format date for graph
    newVisitDate.forEach(function (elem) {
      elem = $filter('date')(new Date(elem), 'dd-MMMM, yyyy');
    });

    var labelsMonth = newVisitMonth.map(function (elem) {
      return $filter('date')(new Date(elem), 'MMMM, yyyy');
    });

    var options = {
      responsive         : false,
      maintainAspectRatio: false
    };

    this.byDay = function() {
      var data = {
          labels: newVisitDate,
          datasets: [
              {
                  label: $filter('translate')('PATIENT_VISIT.NEW_CASES'),
                  fillColor: 'rgba(220,220,220,0.5)',
                  strokeColor: 'rgba(220,220,220,0.8)',
                  highlightFill: 'rgba(220,220,220,0.75)',
                  highlightStroke: 'rgba(220,220,220,1)',
                  data: dataNew
              },
              {
                  label: $filter('translate')('PATIENT_VISIT.OLD_CASES'),
                  fillColor: 'rgba(151,187,205,0.5)',
                  strokeColor: 'rgba(151,187,205,0.8)',
                  highlightFill: 'rgba(151,187,205,0.75)',
                  highlightStroke: 'rgba(151,187,205,1)',
                  data: dataOld
              }
          ]
      };
      // Generate Chart
      var barChart  = new Chart(ctxBar).Bar(data, options);
      var lineChart = new Chart(ctxLine).Line(data, options);
    };

    this.byMonth = function () {
      var data = {
          labels: labelsMonth,
          datasets: [
              {
                  label: $filter('translate')('PATIENT_VISIT.NEW_CASES'),
                  fillColor: 'rgba(220,220,220,0.5)',
                  strokeColor: 'rgba(220,220,220,0.8)',
                  highlightFill: 'rgba(220,220,220,0.75)',
                  highlightStroke: 'rgba(220,220,220,1)',
                  data: monthNew
              },
              {
                  label: $filter('translate')('PATIENT_VISIT.OLD_CASES'),
                  fillColor: 'rgba(151,187,205,0.5)',
                  strokeColor: 'rgba(151,187,205,0.8)',
                  highlightFill: 'rgba(151,187,205,0.75)',
                  highlightStroke: 'rgba(151,187,205,1)',
                  data: monthOld
              }
          ]
      };

      // Generate Chart
      var barChart  = new Chart(ctxBar).Bar(data, options);
      var lineChart = new Chart(ctxLine).Line(data, options);
    };

  }

  function chartGroupBy (type) {
      var Graph = new ChartRender();

      if (type === 'day') {
        Graph.byDay();
      } else {
        Graph.byMonth();
      }
  }

}

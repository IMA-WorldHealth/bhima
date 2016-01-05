angular.module('bhima.controllers')
.controller('journal.utilities', [
  '$scope',
  '$translate',
  '$location',
  '$modal',
  'appcache',
  'connect',
  'validate',
  'appstate',
  'messenger',
  function ($scope, $translate, $location, $modal, Appcache, connect, validate, appstate, messenger) {
    /* jshint unused : false */
    var dependencies = {};
    var columns, options, dataview, grid, manager, deleteColumn;
    var cache = new Appcache('journal.utilities');

    // Three modes : { 'lock', 'static', 'edit' }
    // 'static' -> pj at rest, default
    // 'lock' -> pj locked, can still toggle edit mode, waiting orders
    // 'edit' -> editing: must save before unlocking, all features locked.

    $scope.aggregates = true;
    $scope.hasData = false;
    $scope.filter = { by : {} };

    // TODO : both journal.utilities and journal.controls use this
    // table.  Use a service to share data betwen two controllers
    dependencies.account = {
      query : {
        'tables' : {
          'account' : { 'columns' : ['id', 'account_number', 'account_type_id', 'account_txt'] }
        },
        identifier: 'account_number'
      }
    };

    appstate.register('journal.ready', function (ready) {
      ready.then(function (params) {
        grid = params[0];
        columns = params[1];
        dataview = params[2];
        options = params[3];
        manager = params[4];
        $scope.hasData = dataview.getItems().length > 0;
        return validate.process(dependencies);
      })
      .then(initialise)
      .catch(handleErrors);
    });

    // load saved columns
    cache.fetch('columns')
    .then(function (columns) {
      if (!columns) { return; }
      $scope.columns = columns;
    });

    function initialise(models) {
      for (var k in models) { $scope[k] = models[k]; }

      // check for cache read
      if (!$scope.columns) {
        $scope.columns = angular.copy(columns);
        $scope.columns.forEach(function (column) { column.visible = true; });
      }

      $scope.groupBy('transaction');

      $scope.session = manager.session;
      manager.session.authenticated = false;
      manager.session.mode = 'static';

      dataview.beginUpdate();
      dataview.setFilter(filter);
      dataview.setFilterArgs({
        param : ''
      });
      dataview.endUpdate();

      // expose regrouping method to other scopes
      manager.fn.regroup = function () {
        if ($scope.grouping) { $scope.groupBy($scope.grouping); }
      };

      manager.fn.toggleEditMode = function () {
        $scope.toggleEditMode();
      };

      manager.fn.resetManagerSession = function () {
        $scope.resetManagerSession();
      };

      manager.fn.showDeleteButton = function () {
        showDeleteButton();
      };
    }

    function btnFormatter (row,cell,value,columnDef,dataContext) {
      var id = dataContext.trans_id;
      if (manager.session.transactionId === id) {
        return '<div class="deleteRow" style="cursor: pointer;"><span class="glyphicon glyphicon-trash deleteRow"></span></div>';
      }
      return '';
    }

    deleteColumn = {
      id        : 'deleteRecord',
      field     : 'delete',
      formatter : btnFormatter,
      width: 10
    };

    function showDeleteButton () {
      var columns = grid.getColumns();
      var hasDeleteButton = columns.some(function (col) { return col.id === 'deleteRecord'; });
      if (hasDeleteButton) { return; }
      columns.push(deleteColumn);
      grid.setColumns(columns);
    }

    function handleErrors (error) {
      console.log(error);
    }

    $scope.removeGroup = function removeGroup () {
      dataview.setGrouping();
    };


    // runs the trial balance
    $scope.trialBalance = function () {

      var l = dataview.getLength(),
          transactions = [];

      // loop through the current view and add all the transactions
      // you find to the list of transactions for posting to
      // the general ledger
      // NOTE : MUST BE GROUPED BY TRANS_ID
      for (var i = 0; i < l; i++) {
        var item = dataview.getItem(i);
        if (item.__group) {
          transactions.push(item.value);
        }
      }

      // The modal should make the relevant $http requests so that the client is
      // not confused as to what is happening.  A loading dialog can be displayed
      // on the modal to ensure that everything is fine.
      var modal = $modal.open({
        backdrop: 'static', // this should not close on off click
        keyboard : false,   // do not let esc key close modal
        templateUrl:'partials/journal/trialbalance/trialbalance.html',
        controller: 'TrialBalanceController as BalanceCtrl',
        resolve : {
          transactions : function () {
            return transactions;
          }
        }
      });

      modal.result.then(function () {
        $location.path('/reports/ledger/general_ledger');
      });
    };

    $scope.groupBy = function groupBy(targetGroup) {
      $scope.grouping = targetGroup;

      function groupByTransaction() {
        dataview.setGrouping({
          getter: 'trans_id',
          formatter: formatTransactionGroup,
          comparer : function (a, b) {
            var x =  parseFloat(a.groupingKey.substr(3));
            var y =  parseFloat(b.groupingKey.substr(3));
            return x > y ? 1 : -1;
          },
          aggregators: [
            new Slick.Data.Aggregators.Sum('debit'),
            new Slick.Data.Aggregators.Sum('credit'),
            new Slick.Data.Aggregators.Sum('debit_equiv'),
            new Slick.Data.Aggregators.Sum('credit_equiv')
          ],
          aggregateCollapsed: $scope.aggregates,
          lazyTotalsCalculation : true
        });
      }

      function groupByAccount () {
        dataview.setGrouping({
          getter: 'account_id',
          formatter: function(g) {
            var account = $scope.account.get(g.rows[0].account_number),
                label = account && account.account_txt ?
                  account.account_number + ' ' + account.account_txt :
                  $translate.instant('POSTING_JOURNAL.UNKNOWN_ACCOUNT');
            return '<span style="font-weight: bold">' + label + '</span>';
          },
          aggregators: [
            new Slick.Data.Aggregators.Sum('debit'),
            new Slick.Data.Aggregators.Sum('credit'),
            new Slick.Data.Aggregators.Sum('debit_equiv'),
            new Slick.Data.Aggregators.Sum('credit_equiv')
          ],
          lazyTotalsCalculation : true,
          aggregateCollapsed: $scope.aggregates
        });
      }

      function unGroup () {
        dataview.setGrouping({});
      }

      var groupMap = {
        'transaction' : groupByTransaction,
        'account' : groupByAccount,
        'ungroup' : unGroup
      };

      if (groupMap[targetGroup]) { groupMap[targetGroup](); }
    };


    $scope.refreshFilter = function refreshFilter () {
      $scope.filter.param = '';
      dataview.setFilterArgs({
        param : $scope.filter.param,
        re : new RegExp($scope.filter.param, 'i')
      });
      dataview.refresh();
    };

    function formatTransactionGroup(g) {
      var rowMarkup,
          editTemplate = '';

      var correctRow = g.rows.every(function (row) {
        return row.trans_id === manager.session.transactionId;
      });

      if (manager.session.mode === 'lock') {
        editTemplate = '<div class="pull-right"><a class="editTransaction" style="color: white; cursor: pointer;"><span class="glyphicon glyphicon-pencil"></span> ' + $translate.instant('POSTING_JOURNAL.EDIT_TRANSACTION') + ' </a></div>';
      }

      if (manager.session.mode === 'edit' && correctRow) {
        rowMarkup =
          '<span style="color: white;">' +
          '  <span style="color: white;" class="glyphicon glyphicon-warning-sign"> </span> ' +
          $translate.instant('POSTING_JOURNAL.LIVE_TRANSACTION') + ' <strong>'  + g.value + '</strong> (' + g.count + ' records)' +
          '</span> ' +

          '<span class="pull-right">' +
          '  <a class="addRow" style="color: white; cursor: pointer;"> <span class="glyphicon glyphicon-plus addRow"></span></a>' +
          '  <span style="padding: 5px;"></span>' + // FIXME Hacked spacing;
          '  <a class="save" style="color: white; cursor: pointer;"> <span class="glyphicon glyphicon-floppy-disk saveTransaction"></span></a>' +
          '  <span style="padding: 5px;"></span>' + // FIXME Hacked spacing;
          '  <a class="repost" style="color: white; cursor: pointer;"> <span class="glyphicon glyphicon-refresh repost"></span></a>' +
          '  <span style="padding: 5px;"></span>' + 
          '  <a class="save" style="color: white; cursor: pointer;"> <span class="glyphicon glyphicon-trash deleteTransaction"></span></a>' +
          '</span>';
          
        return rowMarkup;
      }

      rowMarkup = '<span style="font-weight: bold">' + g.value + '</span> (' + g.count + ' records)</span>';
      rowMarkup += editTemplate;
      return rowMarkup;
    }

    $scope.print = function () {
      $location.path('/journal/print');
    };

    // Toggle column visibility
    // this is terrible
    $scope.$watch('columns', function () {
      if (!$scope.columns) { return; }
      var columns = $scope.columns.filter(function (column) { return column.visible; });
      //cache.put('columns', columns);
      grid.setColumns(columns);
    }, true);

    function authenticate () {
      return $modal.open({
        backdrop: 'static', // this should not close on off click
        keyboard : false,   // do not let esc key close modal
        templateUrl:'partials/journal/journal.auth.html',
        controller: 'journal.auth',
      });
    }

    $scope.$watch('session.mode', function () {
      if (!manager || !manager.session || !manager.session.mode) { return; }
      var e = $('#journal_grid');
      e[manager.session.mode === 'static' ? 'removeClass' : 'addClass']('danger');
      //manager.fn.regroup();
      grid.invalidate();
    });

    function beginEditMode () {
      if (manager.session.authenticated) {
        manager.mode = $scope.mode = 'lock';
      } else {
        authenticate()
        .result
        .then(function (result) {
          if (result.authenticated) {
            manager.session.authenticated = result.authenticated;
            manager.session.uuid = result.uuid;
            manager.session.start = result.timestamp;
            manager.session.justification = result.justification;
            manager.session.mode = $scope.session.mode = 'lock';
          }
          manager.fn.regroup();
        })
        .catch(function () {
          messenger.warn({ namespace : 'JOURNAL', description : 'Edit session closed.' });
        });
      }
    }

    function endEditMode () {
      $scope.session = manager.session = { authenticated : false, mode : 'static' };
    }

    $scope.toggleEditMode = function () {
      if (manager.session.mode === 'edit') { return; }
      return manager.session.mode === 'static' ? beginEditMode() : endEditMode();
    };

    $scope.resetManagerSession = function resetManagerSession () {
      $scope.session = manager.session = { authenticated : false, mode : 'static' };
    };

    $scope.toggleAggregates = function toggleAggregates () {
      $scope.aggregates =! $scope.aggregates;
      manager.fn.regroup();
    };

    // accepts a date object
    function formatDate(d) {
      var month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2) { month = '0' + month; }
      if (day.length < 2) { day = '0' + day; }

      return [year, month, day].join('-');
    }

    // filter dataview
    function filter(item, args) {
      var value,
          re = args.re;

      // if there is no filter, let everything through
      if (!$scope.filter.by.field) {  return true; }

      value = item[$scope.filter.by.field];

      // if we are searching for trans_date, it will be in
      // ISO format.  Just split it and compare!
      if ($scope.filter.by.field === 'trans_date') {
        var p = formatDate(value).substr(0, args.param.length);
        return p === args.param;
      }


      // if matches regex, let it through
      return re.test(String(value));
    }

    $scope.updateFilter = function updateFilter () {
      // TODO : make this update when there is no data in filter.param
      if (!$scope.filter.param) { return; }
      if (!$scope.filter.by) { return; }
      dataview.setFilterArgs({
        param : $scope.filter.param,
        re    : new RegExp($scope.filter.param, 'i') // 'i' for ignore case
      });
      dataview.refresh();
    };

    $scope.$watch('filter', $scope.updateFilter, true);
  }
]);

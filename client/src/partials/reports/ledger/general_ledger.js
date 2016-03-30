angular.module('bhima.controllers')
.controller('reportGeneralLedger', ReportGeneralLedger);

ReportGeneralLedger.$inject = [
  '$scope', '$translate', '$filter', 'SessionService', 'validate',
  'GeneralLedgerService', 'GridHelperFactory', 'DateService'
];

function ReportGeneralLedger($scope, $translate, $filter, Session, validate, GLService, GridHelper, Dates) {

  // used by SlickGrid
  var columns, dataview, options, grid;

  function loadData(date) {
    // defaults to today
    GLService.load({ since : Dates.util.str(date) }, true)
    .then(function (store) {

      // bind data from server
      $scope.ledger = store;

      // start up SlickGrid
      setupGridOptions();
      initialiseGrid();
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally();
  }

  // TODO -- put this in a service
  // copied and pasted from depots distributions since this is a quick
  // tshikaji fix.
  $scope.periods = [{
    key : 'CASH_PAYMENTS.DAY',
    method : today
  }, {
    key : 'CASH_PAYMENTS.WEEK',
    method : week
  }, {
    key : 'CASH_PAYMENTS.MONTH',
    method : month
  }, {
    key : 'CASH_PAYMENTS.ALL_TIME',
    method : forever
  }];

  function today() {
    loadData(Dates.current.day());
  }

  function week() {
    loadData(Dates.current.week());
  }

  function month() {
    loadData(Dates.current.month());
  }

  function forever() {
    loadData('0000-00-01');
  }

  // expose the enterprise to the view
  $scope.enterprise = Session.enterprise;

  // init grid
  function setupGridOptions() {

    // Grid formats
    function formatAmount(row, cell, value) {
      return $filter('currency')(value);
    }

    function formatEquiv(row, cell, value) {
      return $filter('currency')(value);
    }

    function formatDate (row, cell, value) {
      return $filter('date')(value, 'yyyy-MM-dd');
    }

    function formatGroupTotalRow(totals, column) {
      var val = totals.sum && totals.sum[column.field];
      if (val !== null) {
        return '<span style=\'font-weight: bold\'>' + $filter('currency')(Math.round(parseFloat(val)*100/100)) + '</span>';
      }
      return '';
    }

    columns = [
      {id: 'uuid'           , name: $translate.instant('COLUMNS.ID')             , field:'uuid'           , visible : false} ,
      {id: 'fiscal_year_id' , name: $translate.instant('COLUMNS.FISCAL_YEAR_ID') , field:'fiscal_year_id' , visible : false} ,
      {id: 'period_id'      , name: $translate.instant('COLUMNS.PERIOD_ID')      , field:'period_id'      , visible : false} ,
      {id: 'trans_id'       , name: $translate.instant('COLUMNS.TRANS_ID')       , field:'trans_id'       , visible : true } ,
      {id: 'trans_date'     , name: $translate.instant('COLUMNS.DATE')           , field:'trans_date'     , visible : true   , formatter: formatDate  , sortable : true },
      {id: 'doc_num'        , name: $translate.instant('COLUMNS.DOCUMENT_ID')    , field:'doc_num'        , visible : false} ,
      {id: 'description'    , name: $translate.instant('COLUMNS.DESCRIPTION')    , field:'description'    , visible : true } ,
      {id: 'number' , name: $translate.instant('COLUMNS.ACCOUNT_NUMBER') , field:'number' , visible : true   , sortable : true } ,
      {id: 'account_id'     , name: $translate.instant('COLUMNS.ACCOUNT_ID')     , field:'account_id'     , visible : false} ,
      {id: 'debit_equiv'    , name: $translate.instant('COLUMNS.DEB_EQUIV')      , field:'debit_equiv'    , visible : true   , formatter: formatEquiv  , groupTotalsFormatter: formatGroupTotalRow } ,
      {id: 'credit_equiv'   , name: $translate.instant('COLUMNS.CRE_EQUIV')      , field:'credit_equiv'   , visible : true   , formatter: formatEquiv  , groupTotalsFormatter: formatGroupTotalRow}  ,
      {id: 'currency_id'    , name: $translate.instant('COLUMNS.CURRENCY')       , field:'currency_id'    , visible : false} ,
      {id: 'deb_cred_uuid'  , name: $translate.instant('COLUMNS.DEBCRED_ID')     , field:'deb_cred_uuid'  , visible : true } ,
      {id: 'deb_cred_type'  , name: $translate.instant('COLUMNS.DC_TYPE')        , field:'deb_cred_type'  , visible : true } ,
      {id: 'inv_po_id'      , name: $translate.instant('COLUMNS.INVPO_ID')       , field:'inv_po_id'      , visible : true } ,
      {id: 'comment'        , name: $translate.instant('COLUMNS.COMMENT')        , field:'comment'        , visible : false} ,
      {id: 'origin_id'      , name: $translate.instant('COLUMNS.ORIGIN_ID')      , field:'origin_id'      , visible : false} ,
      {id: 'user_id'        , name: $translate.instant('COLUMNS.USER_ID')        , field:'user_id'        , visible : false  , sortable : true }
    ];

    // TODO : make this into a directive
    $scope.columns = angular.copy(columns);

    options = {
      enableTextSelectionOnCells : true,
      enableCellNavigation: true,
      enableColumnReorder: true,
      forceFitColumns: true,
      rowHeight: 35
    };
  }

  function initialiseGrid() {
    var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();

    dataview = new Slick.Data.DataView({
      groupItemMetadataProvider : groupItemMetadataProvider,
      inlineFilter : true
    });

    dataview.onRowCountChanged.subscribe(function (e, args) {
      grid.updateRowCount();
      grid.render();
    });

    dataview.onRowsChanged.subscribe(function (e, args) {
      grid.invalidateRows(args.rows);
      grid.render();
    });

    grid = new Slick.Grid('#generalLedger', dataview, columns, options);

    grid.registerPlugin(groupItemMetadataProvider);
    grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));

    // set up sorting
    GridHelper.sorting.setupSorting(grid, dataview);

    // intialize the items
    dataview.beginUpdate();
    dataview.setItems($scope.ledger.data, 'uuid');
    dataview.endUpdate();

    dataview.syncGridSelection(grid, true);


    var filter = $scope.filter = GridHelper.filtering.filter();
    var filterFn = GridHelper.filtering.filterFn(filter);

    // filtering controls

    function clearFilter() {
      GridHelper.filtering.clear(dataview, filter);
    }

    // sets the filter.by parameter to the given column
    function filterBy(column) {
      filter.by = column;
    }

    // updates on ng-model change
    function updateFilter() {
      GridHelper.filtering.update(dataview, filter);
    }

    // init filtering
    GridHelper.filtering.init(dataview, filterFn);

    // expose filtering
    $scope.updateFilter = updateFilter;
    $scope.clearFilter = clearFilter;
    $scope.filterBy = filterBy;
  }

  // grouping
  function groupByTransaction() {
    GridHelper.grouping.byTransaction(dataview, false);
  }

  function groupByAccount() {
    GridHelper.grouping.byAccount(dataview, false);
  }

  function clearGrouping() {
    GridHelper.grouping.clear(dataview);
  }

  function selectDate(choice) {
    $scope.selected = choice;
    $scope.selected.method();
  }

  // make sure that columns are properly filtered
  $scope.$watch('columns', function (cols) {
    GridHelper.columns.filterColumns(grid, cols);
  }, true);

  // expose groupings
  $scope.groupByTransaction = groupByTransaction;
  $scope.groupByAccount = groupByAccount;
  $scope.clearGrouping = clearGrouping;
  $scope.selectDate = selectDate;

  // make sure we filter on today at the startup
  selectDate($scope.periods[0]);
}

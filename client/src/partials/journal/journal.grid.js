angular.module('bhima.controllers')
.controller('journal.grid', [
  '$scope',
  '$translate',
  '$filter',
  '$q',
  'precision',
  'validate',
  'appstate',
  function ($scope, $translate, $filter, $q, precision, validate, appstate) {
    /* jshint unused : false */
    var dependencies = {}, ready = $q.defer();
    var columns, options, dataview, grid, checkboxSelector,
        manager = { session : { selection : [] }, fn : {}, mode : {} };

    // FIXME : this is <i>terrible</i>.  Never ever do this ever again!
    appstate.set('journal.ready', ready.promise);

    dependencies.journal_bis = {
      identifier : 'uuid',
      query : 'journal_list/'
    };

    function initialise (models) {
      angular.extend($scope, models);

      // set up grid properties
      columns = [
        {id: 'trans_id'       , name: $translate.instant('COLUMNS.TRANS_ID')       , field: 'trans_id'       , sortable: true },
        {id: 'trans_date'     , name: $translate.instant('COLUMNS.DATE')           , field: 'trans_date'     , formatter : formatDate, sortable: true},
        {id: 'description'    , name: $translate.instant('COLUMNS.DESCRIPTION')    , field: 'description'    , width: 110, editor: Slick.Editors.Text},
        {id: 'account_id'     , name: $translate.instant('COLUMNS.ACCOUNT_NUMBER') , field: 'account_number' , sortable: true },
        {id: 'debit_equiv'    , name: $translate.instant('COLUMNS.DEB_EQUIV')      , field: 'debit_equiv'    , groupTotalsFormatter: totalFormat , sortable: true, maxWidth: 100, editor:Slick.Editors.Text},
        {id: 'credit_equiv'   , name: $translate.instant('COLUMNS.CRE_EQUIV')      , field: 'credit_equiv'   , groupTotalsFormatter: totalFormat , sortable: true, maxWidth: 100, editor:Slick.Editors.Text},
        {id: 'deb_cred_type'  , name: $translate.instant('COLUMNS.DC_TYPE')        , field: 'deb_cred_type'},
        {id: 'period_id'      , name: $translate.instant('COLUMNS.PERIOD_ID')      , field: 'period'      ,  sortable: true },        
        {id: 'comment'        , name: $translate.instant('COLUMNS.COMMENT')        , field: 'comment'        , sortable : true, editor: Slick.Editors.Text},
        {id: 'cc_id'          , name: $translate.instant('COLUMNS.COST_CENTER')    , field: 'cc'          , sortable : true},
        {id: 'pc_id'          , name: $translate.instant('COLUMNS.PROFIT_CENTER')  , field: 'pc'          , sortable : true}
      ];

      options = {
        enableCellNavigation: true,
        enableColumnReorder: true,
        forceFitColumns: true,
        editable: true,
        rowHeight: 30,
        autoEdit: false
      };

      populate();
    }

    function formatDate(row, col, val) {
      return $filter('date')(val, 'yyyy-MM-dd');
    }

    function populate() {
      var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();

      dataview = new Slick.Data.DataView({
        groupItemMetadataProvider: groupItemMetadataProvider,
        inlineFilter: true
      });

      grid = new Slick.Grid('#journal_grid', dataview, columns, options);

      grid.registerPlugin(groupItemMetadataProvider);
      grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));

      dataview.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
        grid.render();
      });

      dataview.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
      });

      grid.onCellChange.subscribe(function(e, args) {
        var id = args.item.id || args.item.uuid;
        dataview.updateItem(id, args.item);
      });

      $scope.journal_bis.data = $scope.journal_bis.data.map(function (item) {
        item.trans_date = new Date(item.trans_date);
        return item;
      });

      dataview.beginUpdate();
      dataview.setItems($scope.journal_bis.data, 'uuid');
      dataview.endUpdate();

      expose();
    }

    function expose () {
      ready.resolve([grid, columns, dataview, options, manager]);
    }

    function totalFormat(totals, column) {
      var fmt = {
        'credit'       : '#F70303',
        'debit'        : '#02BD02',
        'debit_equiv'  : '#F70303',
        'credit_equiv' : '#02BD02'
      };

      var val = totals.sum && totals.sum[column.field];
      if (val !== null) {
        return '<span style="font-weight: bold; color:' + fmt[column.id] + ';">' + $filter('currency')(precision.round(val)) + '</span>';
      }
      return '';
    }

    validate.process(dependencies)
    .then(initialise)
    .catch(function (error) {
      ready.reject(error);
    });
  }
]);

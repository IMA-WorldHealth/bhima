angular.module('bhima.controllers')
.controller('inventoryView', [
  '$scope',
  '$q',
  '$filter',
  'validate',
  'appstate',
  '$translate',
  function ($scope, $q, $filter, validate, appstate, $translate) {
    /* jshint unused : true */

    // This module provides a view into the inventory to see all registered items.
    // We display these with a slick grid to allow sorting and arbitrary
    // grouping without too much further issue.

    var dependencies = {},
        grid,
        columns,
        options,
        searchStr = '',
        dataview = $scope.dataview = new Slick.Data.DataView();

    // FIXME: Cannot do a join with inventory_unit because inventory.text and inventory_unit.text clash.
    // propose rename inventory.text -> inventory.label

    dependencies.inventory = {
      query : {
        identifier : 'uuid',
        tables : {
          'inventory' : {
            columns: ['uuid', 'code', 'text', 'price', 'unit_id', 'unit_weight', 'unit_volume', 'stock', 'type_id', 'consumable']
          },
          'inventory_group' : {
            columns : ['name']
          }
        },
        join: ['inventory.group_uuid=inventory_group.uuid'],
      }
    };

    dependencies.inventory_unit = {
      query : {
        tables : {
          'inventory_unit': {
            columns : ['id', 'text' ]
          }
        }
      }
    };

    dependencies.inventory_type = {
      query : {
        tables : {
          'inventory_type': {
            columns : ['id', 'text' ]
          }
        }
      }
    };

    var flags = $scope.flags = {};

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      dependencies.inventory.query.where =
        ['inventory.enterprise_id=' + enterprise.id];
      validate.process(dependencies).then(buildStores);
    });

    function buildStores(models) {
      angular.extend($scope, models);
      buildGrid();
    }

    function buildGrid() {

      dataview.onRowCountChanged.subscribe(function () {
        grid.updateRowCount();
        grid.render();
      });

      dataview.onRowsChanged.subscribe(function (e, args) {
        grid.invalidate(args.rows);
        grid.render();
      });

      columns = [
        {id: 'COLUMNS.CODE'        , name: 'Code'               , field: 'code'        , sortable: true  , resizable: true} ,
        {id: 'COLUMNS.TEXT'        , name: 'Text'               , field: 'text'        , sortable: true} ,
        {id: 'COLUMNS.STOCK'       , name: 'Stock Count'        , field: 'stock'       , sortable: true} ,
        {id: 'COLUMNS.GROUP'       , name: 'Inv. Group'         , field: 'name'        , sortable: true} ,
        {id: 'COLUMNS.TYPE'        , name: 'Type'               , field: 'type_id'     , sortable: true  , formatter: formatType},
        {id: 'COLUMNS.UNIT'        , name: 'Unit'               , field: 'unit_id'     , sortable: true  , formatter: formatUnit},
        {id: 'COLUMNS.WEIGHT'      , name: 'Unit Weight'        , field: 'unit_weight' , sortable: true} ,
        {id: 'COLUMNS.VOLUME'      , name: 'Unit Volume'        , field: 'unit_volume' , sortable: true} ,
        {id: 'COLUMNS.CONSUMABLE'  , name: 'Consumable/Durable' , field: 'consumble'   , sortable: true  , formatter: formatConsumable},
        {id: 'COLUMNS.PRICE'       , name: 'Base Price'         , field: 'price'       , sortable: true  , formatter: formatCurrency}
      ];

      // FIXME : this for some reason doesn't always work.

      $q.all(columns.map(function (col){
        return $translate(col.id);
      }))
      .then(function(values){
        columns.forEach(function (col, i){
          col.name = values[i];
        });

        options = {
          enableCellNavigation : true,
          forceFitColumns      : true
        };

        grid = new Slick.Grid('#bhima-inventory-grid', dataview, columns, options);
        grid.onSort.subscribe(sorter);

      });

      // set up sorting

      function sorter (e, args) {
        var field = args.sortCol.field;
        function sort (a, b) { return (a[field] > b[field]) ? 1 : -1; }
        dataview.sort(sort, args.sortAsc);
        grid.invalidate();
      }

      // set up filtering

      function search (item, args) {
        if (item.searchStr !== '' && item.code.indexOf(args.searchStr) === -1 && item.text.indexOf(args.searchStr) === -1) {
          return false;
        }
        return true;
      }

      dataview.setFilter(search);
      dataview.setFilterArgs({
        searchStr: searchStr
      });

      $scope.$watch('flags.search', function () {
        if (!flags.search) {
          flags.search = '';
        }
        searchStr = flags.search;
        dataview.setFilterArgs({
          searchStr: searchStr
        });
        dataview.refresh();
      });

    }

    $scope.$watch('inventory.data', function () {
      if ($scope.dataview && $scope.inventory) {
        $scope.dataview.setItems($scope.inventory.data, 'uuid');
      }
    }, true);

    function formatCurrency (row, col, item) {
      return $filter('currency')(item);
    }

    function formatUnit (row, col, item) {
      return $scope.inventory_unit ? $scope.inventory_unit.get(item).text : item;
    }

    function formatType (row, col, item) {
      return $scope.inventory_type ? $scope.inventory_type.get(item).text : item;
    }

    function formatConsumable (row, col, item) {
      return item === 1 ? 'Consumable' : 'Durable';
    }

    $scope.groupDefinitions = [
      {
        key : 'COLUMNS.TYPE',
        getter: 'type_id',
        formatter: function (g) {
          return '<span style=\'font-weight: bold\'>' + $scope.inventory_type.get(g.value).text + '</span> (' + g.count + ' members)</span>';
        },
        aggregators : []
      },
      {
        key : 'COLUMNS.NAME',
        getter: 'name',
        formatter: function (g) {
          return '<span style=\'font-weight: bold\'>' + g.value + '</span> (' + g.count + ' members)</span>';
        },
        aggregators : []
      },
      {
        key : 'COLUMNS.UNIT',
        getter: 'unit_id',
        formatter: function (g) {
          return '<span style=\'font-weight: bold\'>' + $scope.inventory_unit.get(g.value).text + '</span> (' + g.count + ' members)</span>';
        },
        aggregators : []
      },
      {
        key : 'COLUMNS.CONSUMABLE',
        getter: 'consumable',
        formatter: function (g) {
          return '<span style=\'font-weight: bold\'>' + formatConsumable(null, null, g.value) + '</span> (' + g.count + ' members)</span>';
        },
        aggregators : []
      },
      {
        key : 'COLUMNS.PRICE',
        getter: 'price',
        formatter: function (g) {
          return '<span style=\'font-weight: bold\'>' + formatCurrency(null, null, g.value) + '</span> (' + g.count + ' members)</span>';
        },
        aggregators : []
      }
    ];

    //Utility method
    $scope.groupby = function groupby(groupDefinition) {
      var groupInstance = {};

      groupInstance = JSON.parse(JSON.stringify(groupDefinition));
      groupInstance.aggregateCollapsed = true;
      groupInstance.aggregators = [];

      groupDefinition.aggregators.forEach(function(aggregate) {
        groupInstance.aggregators.push(new Slick.Data.Aggregators.Sum(aggregate));
      });

      groupInstance.formatter = groupDefinition.formatter;
      dataview.setGrouping(groupInstance);
    };

  }
]);

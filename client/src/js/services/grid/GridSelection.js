angular.module('bhima.services')
  .service('GridSelectionService', GridSelectionService);

GridSelectionService.$inject = ['util'];

function GridSelectionService(util) {
  function GridSelection(gridOptions) {
    // key used to determine if multiple selected rows are in the same group
    this._uniqueKey = 'trans_id';
    this.selected = {
      groups : [],
    };

    this.gridOptions = gridOptions;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this._gridApi = api;
      this._gridApi.selection.on.rowSelectionChanged(null, selectedHook.bind(this));
      this._gridApi.selection.on.rowSelectionChangedBatch(null, selectedHookBatch.bind(this));
    }.bind(this));
  }

  function updateSelectedGroups() {
    var currentSelection = this._gridApi.selection.getSelectedRows();
    var currentGroups = collapseRowsToGroups.bind(this)(currentSelection);
    this.selected.groups = currentGroups;
  }

  function selectedHookBatch() {
    updateSelectedGroups.call(this);
  }

  function isHeaderRow(row) {
    return angular.isDefined(row.groupHeader);
  }

  function selectedHook(row) {
    var isHeaderSelected;
    var children;

    var getRowChildren = this._gridApi.treeBase.getRowChildren.bind(this);
    var toggleRowSelectionFn = this._gridApi.selection.toggleRowSelection.bind(this);

    // special treatment to header rows:
    // if the header is selected, select all children.
    // if the header is unselected, unselect all children.
    if (isHeaderRow(row)) {
      isHeaderSelected = row.isSelected;
      children = getRowChildren(row);
      children.forEach(function (child) {
        if (child.isSelected !== isHeaderSelected) {
          toggleRowSelectionFn(child.entity);
        }
      });
    }

    updateSelectedGroups.call(this);
  }

  function collapseRowsToGroups(rows) {
    var groups = {};

    rows.forEach(function (row) {
      groups[row[this._uniqueKey]] = groups[row[this._uniqueKey]] || [];
      groups[row[this._uniqueKey]].push(row);
    }.bind(this));
    return Object.keys(groups);
  }

  return GridSelection;
}

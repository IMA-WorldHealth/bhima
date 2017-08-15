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
      this._gridApi.selection.on.rowSelectionChangedBatch(null, selectedHook.bind(this));
    }.bind(this));
  }

  function selectedHook() {
    var currentSelection = this._gridApi.selection.getSelectedRows();
    var currentGroups = collapseRowsToGroups.bind(this)(currentSelection);
    this.selected.groups = currentGroups;
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

angular.module('bhima.services')
  .service('GridEditorService', GridEditorService);

GridEditorService.$inject = ['util'];

function GridEditorService(util) {

  /**
   * @constructor
   */
  function GridEditors(gridOptions) {

    this.gridOptions = gridOptions;
    this.authenticated = false;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.api = api;

      this.api.edit.on.beginCellEdit(null, function beginCellEdit(row, column) {
        // noop()
      }.bind(this));

      // notify that edits have been canceled
      this.api.edit.on.cancelCellEdit(null, function cancelCellEdit(row, column) {
        // noop()
      });

      this.api.edit.on.afterCellEdit(null, function afterCellEdit(row, column) {
        // noop()
      });

    }.bind(this));
  }


  /**
   * @method requestUserAuthentication
   *
   * @description
   * This method will use the user authentication modal to authenticate a
   * user's edit session.  It is currently unimplemented.
   */
  GridEditors.prototype.requestUserAuthentication = function requestUserAuthentication() {
    // noop()
  };

  return GridEditors;
}

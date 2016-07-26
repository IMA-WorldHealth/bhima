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
        console.log('[external] beginCellEdit');
        this.requestUserAuthentication();
      }.bind(this));

      // notify that edits have been canceled
      this.api.edit.on.cancelCellEdit(null, function cancelCellEdit(row, column) {
        console.log('[external] cancelCellEdit');
      });

      this.api.edit.on.afterCellEdit(null, function afterCellEdit(row, column) {
        console.log('[external] afterCellEdit');
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

    // pretend we got authentication
    //this.authenticated = true;

    // if we are not authenticated, cancel the edit
    if (!this.authenticated) {
      this.api.edit.raise.cancelCellEdit();
    }

    // noop()
  };

  return GridEditors;
}

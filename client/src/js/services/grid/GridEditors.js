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

      this.api.edit.on.beginCellEdit(null, function beginCellEdit() {
        if (gridOptions.authenticateEdits && !this.authenticated) {
          this.requestUserAuthentication();
        }
      }.bind(this));

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
    this.authenticated = true;
    // noop()
  };

  return GridEditors;
}

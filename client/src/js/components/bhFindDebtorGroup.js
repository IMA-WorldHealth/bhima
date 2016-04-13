/**
* <bh-find-debtorgroup></bh-find-debtorgroup>
*
* The find debtor group component is responsible for displaying a component
* for searching a debtor group or a convention
*
* This component takes these attributes :
*   - locked : if we want only debtor groups which are locked or not
*   - is-convention : if we want only debtor groups which are conventions or not
*   - on-search-complete : the callback function which get the returned debtror group
*
* @example
* // component find debtor group
* <bh-find-debtorgroup>
*   locked="true"
*   is-convention="true"
*   on-search-complete="MyCtrl.handleResult"
* </bh-find-debtorgroup>
*/

/** Find Debtor Group Controller */
function FindDebtorGroupController($http, DebtorGroupService) {
  var ctrl         = this,
      callback     = this.callback;

  /** Load debtor group */
  loadDebtorGroup();

  /**
  * loading state :
  * This variable takes these values (0|1|2) :
  *   - 0 = loading
  *   - 1 = loaded
  *   - 2 = error
  *   - null = either value
  */
  ctrl.state = null;

  /**
  * Search view
  */
  ctrl.showSearchView = 'default';

  ctrl.selectDebtorGroup = function(debtorGroup) {
    if (!debtorGroup) { ctrl.state = 2; }
    ctrl.selected = debtorGroup;
    ctrl.state = 1;
    ctrl.showSearchView = 'result';
    callback({ debtorGroup: debtorGroup });
  };

  ctrl.reload = function() {
    ctrl.state = null;
    ctrl.showSearchView = 'default';
  };

  /**
  * @function loadDebtorGroup
  *
  * @desc This function is responsible to loading all debtor groups
  */
  function loadDebtorGroup() {
    ctrl.state = 0;
    var parameters = {};

    /** Is convention debtor group or not */
    if (angular.isDefined(ctrl.isConvention)) {
      parameters.is_convention = Boolean(ctrl.isConvention) ? 1 : 0;
    }

    /** Locked debtor group or not */
    if (angular.isDefined(ctrl.locked)) {
      parameters.locked = Boolean(ctrl.locked) ? 1 : 0;
    }

    DebtorGroupService.read(null, parameters)
    .then(function (response) {
      ctrl.debtorGroupData = response;
    })
    .catch(error)
    .finally();

  }

  function error(err) {
    ctrl.state = 2;
    console.log(err);
  }

}

/** Inject dependencies to the controller */
FindDebtorGroupController.$inject = ['$http', 'DebtorGroupService'];

/** Find Debtor Group Object definition */
var bhFindDebtorGroupComponent = {
  bindings : {
    isConvention : '<',
    locked       : '<',
    callback     : '&onSearchComplete'
  },
  templateUrl : 'partials/templates/findDebtorGroup.tmpl.html',
  controller  : FindDebtorGroupController
};

/** Component for BHIMA */
angular.module('bhima.components')
.component('bhFindDebtorgroup', bhFindDebtorGroupComponent);

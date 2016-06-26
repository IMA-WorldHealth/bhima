angular.module('bhima.components')
.component('bhBreadcrumb', {
  bindings: {
    path: '<',
    button: '<',
    label: '<',
    dropdown: '<'
  },
  templateUrl  : 'partials/templates/breadcrumb.tmpl.html',
  controller   : BreadcrumbController,
  controllerAs : 'vm'
});


/**
 *
 * @class bhBreadcrumb
 *
 * @description
 * The Breadcrumb component is responsible to display the breadcrumb navigation
 * and all action buttons attached to it.
 *
 * This component take these attributes :
 *   - path : which take an array which contains paths
 *   - button : which takes an array of button objects
 *   - dropdown : which takes an array of object as dropdown
 *   - label : which takes an array of label objects
 *
 * @example
 * <!-- Simple breadcrumb navigation in the view -->
 * <bh-breadcrumb
 *   path="MyCtrl.bcPaths"
 *   button="MyCtrl.bcButtons"
 *   dropdown="MyCtrl.bcDropdowns"
 *   Label="MyCtrl.bcLabels">
 * </bh-breadcrumb>
*/
function BreadcrumbController() {
  var vm = this;

  /**
   * Paths definition
   * @example
   * vm.bcPaths = [
   *  { label: 'path1', link: '#/path1_link_to_go' },
   *  { label: 'path2', link: '#/path1_link_to_go' },
   *  { label: 'path3', link: '#/path1_link_to_go', current: true },
   * ];
   */
  vm.bcPaths = vm.path || [];

  /**
   * Buttons definition
   * @example
   * vm.bcButtons = [
   *  { icon: 'glyphicon glyphicon-print', label: 'Print', action: buttonAction },
   *  { icon: 'glyphicon glyphicon-repeat', label: 'Repeat', action: buttonAction, color: 'btn-danger' },
   *  { icon: 'glyphicon glyphicon-refresh', label: 'Refresh', action: buttonAction }
   * ];
   */
  vm.bcButtons = vm.button || [];

  /**
   * Labels definition
   * @example
   * vm.bcLabels = [
   *  { icon: 'glyphicon glyphicon-print', label: 'My Label 1' },
   *  { label: 'My label 2' },
   *  { label: 'My label 3' }
   * ];
   */
  vm.bcLabels = vm.label || [];

  /**
   * Dropdowns definition
   * @example
   * vm.bcDropdowns = [
   *  {
   *   label : 'Dropdown 1',
   *   color : 'btn-primary',
   *   option : [
   *    { label : 'Fc', action : dropdownAction },
   *    { label : '$', action : dropdownAction }
   *   ]
   *  },
   *  {
   *   label : 'Dropdown 2',
   *   color : 'btn-success',
   *   option : [
   *    { label : 'item1 dd2 with a too long text that you can imagine', action : dropdownAction },
   *    { label : 'item2 dd2', action : dropdownAction }
   *   ]
   *  }
   * ];
   */
  vm.bcDropdowns = vm.dropdown || [];

  vm.dropDownItemSelectedLabel = ''; //for the test purpose

  /** call the appropriate function and update the dropdown label **/
  vm.helperDropdown = function helperDropdown(child, parent) {
    vm.dropDownItemSelectedLabel = parent.selected = child.label;

    child.action(child);
  };

  // init dropdown buttons
  vm.bcDropdowns.forEach(function (elem) {
    elem.selected = elem.label;
  });
}

angular.module('bhima.components')
.component('bhBreadcrumb', {
  bindings: {
    path: '<',
    button: '<',
    label: '<',
    dropdown: '<',
    print : '<',
    download : '<'
  },
  templateUrl  : 'modules/templates/breadcrumb.tmpl.html',
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
 *   - download : which takes element on <bh-renderer-dropdown>
 *
 * @example
 * <!-- Simple breadcrumb navigation in the view -->
 * <bh-breadcrumb
 *   path="MyCtrl.bcPaths"
 *   button="MyCtrl.bcButtons"
 *   dropdown="MyCtrl.bcDropdowns"
 *   Label="MyCtrl.bcLabels"
 *   download = "MyCtrl.dropdownDownload">
 * </bh-breadcrumb>
*/
function BreadcrumbController() {
  var vm = this;

  this.$onInit = function $onInit() {
    // variable to prefix all our ids at the view
    vm.prefix = 'breadcrumb-';

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

    vm.buttonPrint = vm.print || [];

    vm.dropdownDownload = vm.download || [];

    // init dropdown buttons
    vm.bcDropdowns.forEach(function (elem) {
      elem.selected = elem.label;
    });

    /** call the appropriate function and update the dropdown label **/
    vm.helperDropdown = function helperDropdown(child, parent) {
      parent.selected = child.label;
      child.action(child);
    };
  };
}

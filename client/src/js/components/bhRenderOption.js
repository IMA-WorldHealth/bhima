angular.module('bhima.components')
  .component('bhRenderOption', {
    templateUrl : '/modules/templates/bhRenderOption.tmpl.html',
    controller  : RenderOptionController,
    bindings    : {
      orientation         : '=', // two-way binding
    },
  });


/**
 * bhDateEditor Component
 *
 * A component to deal with date, it lets a user choose a date by either typing
 * into an <input> or clicking a calendar dropdown.  It wraps the
 * uib-date-picker to provide the dropdown calendar functionality.
 *
 * @example
 * <bh-render-option
 *  orientation="vm.orientation">
 * </bh-render-option>
 *
 * @module components/bhRenderOption
 */
function RenderOptionController() {
  const ctrl = this;

  this.$onInit = function $onInit() {
    ctrl.orientation = ctrl.orientation || 'portrait';
  };

}

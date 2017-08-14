angular.module('bhima.components')
  .component('bhDateEditor', {
    templateUrl : '/modules/templates/bhDateEditor.tmpl.html',
    controller  : DateEditorController,
    bindings    : {
      dateValue : '<',
      onChange : '&',
      minDate : '<',
      maxDate : '<',
      disabled : '<?',
      dateFormat : '@?',
      label : '@?',
    },
  });

DateEditorController.$inject = ['bhConstants'];

/**
 * bhDateEditor Component
 *
 * A component to deal with date, it lets a user choose a date by either typing
 * into an <input> or clicking a calendar dropdown.  It wraps the
 * uib-date-picker to provide the dropdown calendar functionality.
 *
 * @example
 * <bh-date-editor
 *  date-value="Ctrl.date"
 *  date-format="'yyyy-MM-dd'"
 *  min-date="Ctrl.min"
 *  max-date="Ctrl.max"
 *  disabled="Ctrl.isDisabled">
 * </bh-date-editor>
 *
 * @module components/bhDateEditor
 */
function DateEditorController(bhConstants) {
  var $ctrl = this;

  $ctrl.$onInit = function $onInit() {
    $ctrl.dateFormat = bhConstants.dayOptions.format;

    $ctrl.editMode = false;

    $ctrl.label = $ctrl.label || 'FORM.LABELS.DATE';

    // options to be passed to datepicker-option
    $ctrl.options = {
      minDate : $ctrl.minDate,
      maxDate : $ctrl.maxDate,
    };
  };


  // opens/closes the date dropdown
  $ctrl.toggleEditMode = function toggleEditMode() {
    $ctrl.editMode = !$ctrl.editMode;
  };

  $ctrl._onChange = function _onChange() {
    $ctrl.onChange({ date : $ctrl.dateValue });
  };
}

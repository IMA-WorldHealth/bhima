angular.module('bhima.components')
.component('bhDateEditor', {
	templateUrl : '/partials/templates/bhDateEditor.tmpl.html',
	controller : dateEditorController,
	bindings : {
		dateValue : '=',  // two-way binding
		minDate : '<',    // one-way binding
		maxDate : '<',    // one-way binding
		validationTrigger : '<', // one-way binding
		dateFormat : '@', // bind text
    label : '@'       // bind text
	}
});


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
 *  validation-trigger="Form.$submitted"
 * >
 * </bh-date-editor>
 *
 * @module components/bhDateEditor
 */
function dateEditorController() {
	var ctrl = this;

	ctrl.editMode = false;
	ctrl.toggleEditMode = toggleEditMode;

  // options to be passed to datepicker-option
  ctrl.options = {
    minDate : ctrl.minDate,
    maxDate : ctrl.maxDate
  };

  // opens/closes the date dropdown
	function toggleEditMode() {
		ctrl.editMode = !ctrl.editMode;
	}
}

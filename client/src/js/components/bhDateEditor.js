/**
* The date editor component
*
* @module components/dateEditor
*
* @description a component to deal with date, it let you choose a date
* This component can do his own validation based on parameters values provided*
* 
**/

//A date editor component controller

function dateEditorController (){
	var ctrl = this;

	ctrl.editMode = false;
	ctrl.dateValue =  ctrl.dateValue || new Date();

	function changeMode (){
		ctrl.editMode = !ctrl.editMode;
	}

	ctrl.changeMode = changeMode;
}

//component implementation
angular.module('bhima.components').component('bhDateEditor', {
	templateUrl : '/partials/templates/bhDateEditor.tmpl.html',
	controller : dateEditorController,
	bindings : {
		dateValue : '=',
		dateFormat : '<',
		minDate : '<',
		maxDate : '<',
		form : '<',
		validationTrigger : '<'
	}	
});
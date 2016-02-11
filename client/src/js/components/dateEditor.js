/**
* The date editor component
*
* @module components/dateEditor
*
* @description a component to deal with date, it let you choose a date
* This component can do his own validation based on parameters values provided*
* 
**/ 

/**
* A date editor component controller
* @param {object} $scope an angular object which expose the model to the view
* @param {object} $element an angular object, which present a json form of an element
* @param {object} $attrs an angular object, which present a json form of attributs
**/

function dateEditorController ($scope, $element, $attrs, util){
	var ctrl = this;

	this.$onInit = function (){
		this.editMode = false;
		this.dateValue =  this.dateValue || new Date();
	};

	this.changeMode = function (){
		this.editMode = !this.editMode;
	}
}

//injecting services to the controller
dateEditorController.$inject = ['$scope', '$element', '$attrs'];

//component implementation
angular.module('bhima.components').component('dateEditor', {
	templateUrl : '/partials/templates/dateEditor.tmpl.html',
	controller : dateEditorController,
	bindings : {
		dateValue : '=',
		dateFormat : '=',
		minDate : '=',
		maxDate : '=',
		form : '<',
		validationTrigger : '<'
	}	
});
/**
 * The employee finder component
 *
 * @module components/bhEmployeeFinder
 *
 * @description a component to deal with employee, it let you choose a employee
 * 
 **/
 
//An employee finder component controller
 
function employeeFinderController (employeeService){ 	
 	var ctrl = this;

 	ctrl.searchOptions = [
 		{key : 'code', label : 'EMPLOYEE.CODE', placeHolder : 'EMPLOYEE.SEARCH_BY_CODE'},
 		{key : 'names', label : 'EMPLOYEE.NAME', placeHolder : 'EMPLOYEE.SEARCH_BY_NAME'}
 	];

 	function load (){
 		ctrl.selectedEmployee = null;
 		ctrl.employeeValue = null;
 		ctrl.session = {state : 'finding'};
 		setSearchOption(ctrl.searchOptions[0]); 

 		employeeService.read()
 		.then(function (employees){
 			ctrl.employees = employees;
 		});		
	}

	function setSearchOption (searchOption){
		ctrl.selectedSearchOption = searchOption;
	}

	function selectEmployee (item){
		ctrl.selectedEmployee = item;
		ctrl.employeeValue = item.account_id;
		ctrl.session.state = 'found';
	}

	function search (text) {

		return ctrl.employees.filter(function (item){
			var content = ctrl.selectedSearchOption.key === 'names' ? [item.prenom, item.name, item.postnom].join('') : item.code_employee;
			return new RegExp(text, 'i').test(content); //build a regex a look for text occurence in the employee names without case sensive
		});
	}

	function formatEmployee (employee) {
		if(!employee) return '';

		return [
				employee.prenom,
				employee.name,
				employee.postnom,
				'[' + employee.code_employee + ']'
			].join('  ');
	}

	load();

	ctrl.formatEmployee = formatEmployee;
 	ctrl.load = load;
 	ctrl.search = search;
 	ctrl.selectEmployee = selectEmployee;	
 	ctrl.setSearchOption = setSearchOption; 
}

employeeFinderController.$inject = ['EmployeeService'];
 
 //component implementation
angular.module('bhima.components').component('bhEmployeeFinder', {
	templateUrl : '/partials/templates/bhEmployeeFinder.tmpl.html',
 	controller : employeeFinderController,
 	bindings : {
 		employeeValue : '='
 	}
});
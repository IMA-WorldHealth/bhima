/**
 * The employee finder component
 *
 * @module components/bhEmployeeFinder
 *
 * @description a component to deal with employee, it let you choose a employee and return back is account_id
 * 
 **/
 
/**An employee finder component controller**/
 
function employeeFinderController (employeeService, Appcache){ 	
 	var ctrl = this;
 	var cache = new Appcache('employeeFinderComponent'); //using appcache to persist the option choice

 	//search options array

 	ctrl.searchOptions = [
 		{key : 'code', label : 'EMPLOYEE.CODE', placeHolder : 'EMPLOYEE.SEARCH_BY_CODE'},
 		{key : 'names', label : 'EMPLOYEE.NAME', placeHolder : 'EMPLOYEE.SEARCH_BY_NAME'}
 	]; 	

	/**
	* @method load
	*
	* @description This called the first to initialize data
	*/

 	function load (){
 		ctrl.selectedEmployee = null;
 		ctrl.employeeAccountId = null;
 		ctrl.searchStarted = false;
 		ctrl.state = 'finding';
 		cache.fetch('searchOptionKey')
 		.then(setSearchOption);
	}

	/**
	* @method setSearchOption
	*
	* @param {String} searchOption The option to set
	*
	* @description set a search option and make it persistent through appcache
	*/

	function setSearchOption (searchOption){
		ctrl.selectedSearchOption = searchOption || ctrl.searchOptions[0];
		cache.put('searchOptionKey', searchOption);
	}

	/**
	* @method selectEmployee
	*
	*@param {object} employee The employee to set
	*
	* @description set an employee and update the employeeAccountId and the state as well
	*/

	function selectEmployee (employee){
		ctrl.selectedEmployee = employee;
		ctrl.employeeAccountId = employee.account_id;
		ctrl.state = 'found';
	}

	/**
	* @method search
	*
	*@param {String} text The token to use for research
	*
	* @description take a token and look the employee by code or names according to the option choosen
	*/

	function search (text) {
		ctrl.searchStarted = true;
		return employeeService.search(ctrl.selectedSearchOption.key, text)
 		.then(function (employees){
 			ctrl.searchSucceed = true; 
 			employees.forEach(function (employee){
 				employee.label = formatEmployee(employee);
 			});		
 			return employees;
 		})
 		.catch(function (err){
 			ctrl.searchSucceed = false;
 		});
	}

	/**
	* @method formatEmployee
	*
	*@param {object} employee the employee to format
	*
	* @description take an employee and return back a formated string to use at the view
	*/

	function formatEmployee (employee) {
		return [
				employee.prenom,
				employee.name,
				employee.postnom,
				'[' + employee.code_employee + ']'
			].join('  ');
	}

	load();

	//expose methods to the view
 	ctrl.load = load;
 	ctrl.search = search;
 	ctrl.selectEmployee = selectEmployee;	
 	ctrl.setSearchOption = setSearchOption; 
}

employeeFinderController.$inject = ['EmployeeService', 'appcache'];
 
 //component implementation
angular.module('bhima.components').component('bhEmployeeFinder', {
	templateUrl : '/partials/templates/bhEmployeeFinder.tmpl.html',
 	controller : employeeFinderController,
 	bindings : {
 		employeeAccountId : '='
 	}
});
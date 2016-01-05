angular.module('bhima.directives')
.directive('findEmployee', ['$compile', 'validate', 'messenger', 'appcache', function($compile, validate, messenger, Appcache) {
  return {
    restrict: 'A',
    templateUrl: '/partials/templates/findemployee.tmpl.html',
    link : function(scope, element, attrs) {
      var dependencies = {}, employeeList = scope.employeeList = [];
      var searchCallback = scope[attrs.onSearchComplete];
      var cache = new Appcache('employeeSearchDirective');

      if (!searchCallback) { throw new Error('Employee Search directive must implement data-on-search-complete'); }

      dependencies.employee = {
        required : true,
        query : 'employee_list/'
      };

      dependencies.project = {
        query : {
          identifier : 'abbr',
          tables : {
            project : { columns : ['abbr', 'id'] }
          }
        }
      };

      scope.findEmployee = {
        state : 'name',
        submitSuccess : false,
        enableRefresh : attrs.enableRefresh || true
      };

      var stateMap = {
        'name' : searchName,
        'id' : searchId
      };

      //TODO Downloads all patients for now - this should be swapped for an asynchronous search
      validate.process(dependencies).then(findEmployee);
      cache.fetch('cacheState').then(loadDefaultState);

      function findEmployee(model) {
        scope.findEmployee.model = model;
        // extractMetaData(model.employee.data);
        var employees = extractMetaData(model.employee.data);
        employeeList = scope.employeeList = angular.copy(employees);
      }

      function searchName(value) {
        if (typeof(value) === 'string') {
          return messenger.danger('Submitted an invalid employee');
        }
        scope.findEmployee.employee = value;
        searchCallback(value);
        scope.findEmployee.submitSuccess = true;
      }

      function searchId(value) {
        var id = value, project;

        if (!id) {
          return messenger.danger('Cannot parse employee ID');
        }

        dependencies.employee.query.where = [
          'employee.id=' + id
        ];

        validate.refresh(dependencies, ['employee']).then(handleIdRequest, handleIdError);
      }

      function handleIdRequest(model) {
        var employee = scope.findEmployee.employee = extractMetaData(model.employee.data)[0];
        if (!employee) {
          return messenger.danger('Received invalid employee, unknown');
        }
        scope.findEmployee.valid = true;
        searchCallback(employee);
        scope.findEmployee.submitSuccess = true;
      }

      function handleIdError(error) {
        scope.findEmployee.valid = false;
        //Naive implementation
        if (error.validModelError) {
          if (error.flag === 'required') {
            messenger.danger('Employee record cannot be found');
          }
        }
      }

      function submitEmployee(value) {
        stateMap[scope.findEmployee.state](value);
      }

      function extractMetaData(employeeData) {

        employeeData.forEach(function(employee) {
          employee.name = employee.prenom + ' ' + employee.name;
        });
        return employeeData;
      }

      function validateNameSearch(value) {
        if (!value) { return true; }

        if (typeof(value) === 'string') {
          scope.findEmployee.valid = false;
          return true;
        }
        scope.findEmployee.valid = true;
      }

      function resetSearch() {
        scope.findEmployee.valid = false;
        scope.findEmployee.submitSuccess = false;
        scope.findEmployee.employee = '';
      }

      function updateState(newState) {
        scope.findEmployee.state = newState;
        cache.put('cacheState', {state: newState});
      }

      // FIXME Configure component on this data being available, avoid glitching interface
      function loadDefaultState(defaultState) {
        if (defaultState) {
          scope.findEmployee.state = defaultState.state;
          return;
        }
      }

      scope.validateNameSearch = validateNameSearch;
      scope.findEmployee.refresh = resetSearch;
      scope.submitEmployee = submitEmployee;

      scope.findEmployee.updateState = updateState;
    }
  };
}]);

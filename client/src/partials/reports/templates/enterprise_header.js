angular.module('bhima.controllers')
.controller('templates.enterprise_header', [
	'$scope',
	'validate',
	'appstate', 
	function ($scope, validate, appstate) {
		var template = $scope.template = {},
        dependencies = {};

	    dependencies.projects = {
	      query : {
	        tables : {
	          'project' : {
	            columns : ['id', 'abbr', 'name']
	          }
	        }
	      }
	    };

	    dependencies.enterprise = {
	      query : {
	        tables : {
	          'enterprise' : { columns : ['name', 'abbr'] },
	          'village'    : { columns : ['name::villageName'] },
	          'sector'     : { columns : ['name::sectorName'] },
	          'province'   : { columns : ['name::provinceName'] }
	        },
	        join : ['enterprise.location_id=village.uuid', 'village.sector_uuid=sector.uuid', 'sector.province_uuid=province.uuid']
	      }
	    };

	    appstate.register('project', function (project) {
			template.project = project;
			dependencies.enterprise.where = 'enterprise.id=' + project.enterprise_id;

			validate.process(dependencies)
			.then(function (models) {
				template.enterprise = models.enterprise.data[0];
			});
		});
	
}]);
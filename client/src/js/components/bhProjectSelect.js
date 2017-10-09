angular.module('bhima.components')
  .component('bhProjectSelect', {
    templateUrl : 'modules/templates/bhProjectSelect.tmpl.html',
    controller  : ProjectSelectController,
    transclude  : true,
    bindings    : {
      projectId        : '<',
      onSelectCallback : '&',
      name             : '@?',     
    },
  });

ProjectSelectController.$inject = [
  'ProjectService', 'NotifyService'
];

/**
 * Project Select component
 *
 */
function ProjectSelectController(Projects, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    Projects.read()
      .then(function (projects) {
        $ctrl.projects = projects;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ project : $item });
  };
}
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
  'ProjectService', 'NotifyService',
];

/**
 * Project Select component
 *
 */
function ProjectSelectController(Projects, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    Projects.read()
      .then((projects) => {
        $ctrl.projects = projects;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ project : $item });
  };
}

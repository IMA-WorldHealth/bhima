angular.module('bhima.components')
  .component('bhProjectsMultipleSelect', {
    templateUrl : 'modules/templates/bhProjectsMultipleSelect.tmpl.html',
    controller  : ProjectsMultipleSelectController,
    bindings    : {
      onChange : '&',
      projectsIds : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

ProjectsMultipleSelectController.$inject = [
  'ProjectService', 'NotifyService',
];

/**
 * Projects Selection Component
 *
 */
function ProjectsMultipleSelectController(Projects, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.PROJECT';

    // fired when the Projects has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange;

    // init the model
    $ctrl.selectedProjects = $ctrl.projectsIds || [];

    // load all Projects
    Projects.read()
      .then((projects) => {
        $ctrl.projects = projects;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function handleChange(models) {
    $ctrl.onChange({ projects : models });
  };
}

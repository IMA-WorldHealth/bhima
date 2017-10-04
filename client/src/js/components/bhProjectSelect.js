angular.module('bhima.components')
  .component('bhProjectSelect', {
    templateUrl : 'modules/templates/bhProjectSelect.tmpl.html',
    controller  : projectSelectController,
    transclude  : true,
    bindings    : {
      projectId        : '<',
      disable          : '<?',
      onSelectCallback : '&',
      name             : '@?',
      required         : '<?',      
    },
  });

projectSelectController.$inject = [
  'ProjectService', 'NotifyService'
];

/**
 * Project Select component
 *
 */
function projectSelectController(Projects, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when a project has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'FORM.LABELS.PROJECT';

    Projects.read()
      .then(function (projects) {
        $ctrl.projects = projects;
      })
      .catch(Notify.handleError);

    $ctrl.valid = true;

  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ project : $item });
  };
}
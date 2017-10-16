angular.module('bhima.components')
  .component('bhGradeSelect', {
    templateUrl : 'modules/templates/bhGradeSelect.tmpl.html',
    controller  : GradeSelectController,
    transclude  : true,
    bindings    : {
      gradeUuid        : '<',
      onSelectCallback : '&',      
    },
  });

GradeSelectController.$inject = [
  'GradeService', 'NotifyService',
];

/**
 * Grade Select Controller
 *
 */
function GradeSelectController(Grades, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    

    Grades.read()
      .then(function (grades) {
        $ctrl.grades = grades;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ grade : $item });
  };
}
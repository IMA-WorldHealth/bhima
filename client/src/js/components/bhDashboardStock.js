angular.module('bhima.components')
  .component('bhDashboardStock', {
    templateUrl : 'modules/templates/bhDashboardStock.tmpl.html',
    controller  : DashboardStock,
    transclude  : true,
    bindings    : {
      type        : '<',
      label : '@?',
    },
  });

DashboardStock.$inject = [
  'GradeService', 'NotifyService',
];

/**
 * Dashboard Stock Controller
 *
 */
function DashboardStock(Grades, Notify) {
  const $ctrl = this;
  $ctrl.label = $ctrl.label || 'FORM.LABELS.GRADE';
  $ctrl.$onInit = function onInit() {
    $ctrl.required = $ctrl.required || false;
    Grades.read()
      .then((grades) => {
        $ctrl.grades = grades;
      })
      .catch(Notify.handleError);
  };
}

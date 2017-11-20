angular.module('bhima.controllers')
  .controller('GradeModalController', GradeModalController);

GradeModalController.$inject = [
  '$state', 'GradeService', 'ModalService', 'NotifyService',
];

function GradeModalController($state, Grades, ModalService, Notify) {
  var vm = this;

  vm.grade = $state.params.grade;
  vm.isCreating = !!($state.params.creating);

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  // submit the data to the server from all two forms (update, create)
  function submit(gradeForm) {
    var promise;

    if (gradeForm.$invalid || gradeForm.$pristine) { return 0; }

    promise = (vm.isCreating) ?
      Grades.create(vm.grade) :
      Grades.update(vm.grade.uuid, vm.grade);

    return promise
      .then(function () {
        var translateKey = (vm.isCreating) ? 'GRADE.CREATED' : 'GRADE.UPDATED';
        Notify.success(translateKey);
        $state.go('grades', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function closeModal() {
    $state.go('grades');
  }
}

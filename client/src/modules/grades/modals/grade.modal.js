angular.module('bhima.controllers')
  .controller('GradeModalController', GradeModalController);

GradeModalController.$inject = [
  '$state', 'GradeService', 'ModalService', 'NotifyService', 'appcache',
];

function GradeModalController($state, Grades, ModalService, Notify, AppCache) {
  var vm = this;

  var cache = AppCache('GradeModal');

  if ($state.params.creating || $state.params.uuid) {
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }
  vm.isCreating = vm.stateParams.creating;  

  // exposed methods
  vm.submit = submit;
  vm.closeModal = closeModal;

  if (!vm.isCreating) {
    Grades.read(vm.stateParams.uuid)
      .then(function (grade) {
        vm.grade = grade;
      })
      .catch(Notify.handleError);
  }

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

angular.module('bhima.controllers')
  .controller('CommentJournalController', CommentJournalController);

// DI
CommentJournalController.$inject = [
  '$uibModalInstance', 'modalParameters', 'JournalService', 'NotifyService',
];

// Comment Account Statement Controller
function CommentJournalController(Instance, ModalParameters, Journal, Notify) {
  var vm = this;

  vm.cancel = Instance.dismiss;
  vm.submit = submit;
  vm.rows = ModalParameters.rows;

  // submit the comment
  function submit(form) {
    if (form.$invalid) { return; }

    var params = {
      uuids : getRowsUuid(vm.rows),
      comment : vm.comment,
    };

    Journal.commentPostingJournal(params)
      .then(function (res) {
        if (!res) { return; }
        Instance.close(vm.comment);
      })
      .catch(Notify.handleError)
      .finally(Instance.close);
  }

  // get rows uuid
  function getRowsUuid(rows) {
    return rows.map(function (row) {
      return row.entity.uuid;
    });
  }
}

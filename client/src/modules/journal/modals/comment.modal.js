angular.module('bhima.controllers')
  .controller('CommentJournalController', CommentJournalController);

// DI
CommentJournalController.$inject = [
  '$uibModalInstance', 'modalParameters', 'JournalService', 'NotifyService',
];

// Comment Account Statement Controller
function CommentJournalController(Instance, ModalParameters, Journal, Notify) {
  var vm = this;
  var comments;

  vm.cancel = Instance.dismiss;
  vm.submit = submit;
  vm.rows = ModalParameters.rows;

  // get the unique comments
  comments = vm.rows
    .map(function (row) {
      return row.entity.comment;
    })
    .filter(function (comment, index, array) {
      return array.indexOf(comment) === index;
    });

  if (comments.length === 1) {
    vm.comment = comments[0];
  }

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

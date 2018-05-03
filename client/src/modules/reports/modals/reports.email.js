angular.module('bhima.controllers')
  .controller('EmailReportController', EmailReportController);

EmailReportController.$inject = [
  '$uibModalInstance', 'NotifyService', 'BaseReportService', 'options',
  'SessionService',
];

function EmailReportController(ModalInstance, Notify, SavedReports, options, Session) {
  var vm = this;

  vm.reportName = options.reportName;

  vm.params = {
    email : Session.user.email,
  };

  vm.submit = function submit(EmailForm) {
    if (EmailForm.$invalid) { return 1; }

    return SavedReports.emailReport(options.uuid, vm.params.email)
      .then(function () {
        ModalInstance.close({ sent : true });
      })
      .catch(Notify.handleError);
  };

  vm.dismiss = function dismiss() {
    ModalInstance.close({ sent : false });
  };
}

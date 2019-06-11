angular.module('bhima.components')
  .component('bhCronEmailReport', {
    templateUrl : 'js/components/bhCronEmailReport/bhCronEmailReport.html',
    controller  : bhCronEmailReportController,
    transclude  : true,
    bindings    : {
      reportId      : '<',
      reportForm    : '<',
      reportDetails : '<',
    },
  });

bhCronEmailReportController.$inject = [
  'CronEmailReportService', 'NotifyService',
];

function bhCronEmailReportController(CronEmailReports, Notify) {
  const $ctrl = this;

  $ctrl.submit = submit;

  $ctrl.onSelectEntityGroup = entityGroup => {
    $ctrl.cron.entity_group_uuid = entityGroup.uuid;
  };

  $ctrl.onSelectCron = cron => {
    $ctrl.cron.cron_id = cron.id;
  };

  function load() {
    CronEmailReports.read()
      .then(rows => {
        $ctrl.list = rows;
      })
      .catch(Notify.handleError);
  }

  function submit(cronForm, reportForm) {
    if (reportForm.$invalid) {
      Notify.warn('CRON.PLEASE_FILL_REPORT_FORM');
      return;
    }

    if (cronForm.$invalid) {
      Notify.warn('CRON.PLEASE_FILL_CRON_FORM');
      return;
    }

    const params = {
      cron : $ctrl.cron,
      report : $ctrl.reportDetails,
    };

    CronEmailReports.create(params)
      .then(() => load())
      .catch(Notify.handleError);
  }

  load();
}

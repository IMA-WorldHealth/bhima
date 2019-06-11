angular.module('bhima.components')
  .component('bhCronEmailReport', {
    templateUrl : 'js/components/bhCronEmailReport/bhCronEmailReport.html',
    controller  : bhCronEmailReportController,
    transclude  : true,
    bindings    : {
      reportId       : '@',
      reportUrl      : '@',
      reportForm     : '<',
      reportDetails  : '<',
      onSelectReport : '&',
    },
  });

bhCronEmailReportController.$inject = [
  'CronEmailReportService', 'NotifyService',
];

function bhCronEmailReportController(CronEmailReports, Notify) {
  const $ctrl = this;

  $ctrl.submit = submit;
  $ctrl.remove = remove;
  $ctrl.details = details;

  $ctrl.onSelectEntityGroup = entityGroup => {
    $ctrl.cron.entity_group_uuid = entityGroup.uuid;
  };

  $ctrl.onSelectCron = cron => {
    $ctrl.cron.cron_id = cron.id;
  };

  $ctrl.$onInit = () => {
    $ctrl.cron = {
      report_id : $ctrl.reportId,
      report_url : $ctrl.reportUrl,
    };
  };

  function load() {
    CronEmailReports.read()
      .then(rows => {
        $ctrl.list = rows;
      })
      .catch(Notify.handleError);
  }

  function details(id) {
    CronEmailReports.read(id)
      .then(row => {
        if (!row) { return; }
        const report = JSON.parse(row.params);
        $ctrl.onSelectReport({ report });
      })
      .catch(Notify.handleError);
  }

  function remove(id) {
    CronEmailReports.delete(id)
      .then(() => load())
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

angular.module('bhima.components')
  .component('bhPatientVisit', {
    bindings : {
      patientUuid : '<',
    },
    templateUrl : 'modules/patients/record/bh-patient-visit.html',
    controller  : VisitsController,
  });

VisitsController.$inject = ['PatientService', 'NotifyService', 'moment'];

function VisitsController(Patients, Notify, Moment) {
  const $ctrl = this;
  let mostRecentVisit;

  // Currently not limited on client to give accurate representation of total
  // number of visits
  const DEFAULT_VISIT_LIMIT = 3;

  this.$onInit = () => {
    $ctrl.loaded = false;
    $ctrl.visiting = false;

    $ctrl.limitVisitDisplay = DEFAULT_VISIT_LIMIT;

    refreshVisitFeed();
  };

  // expose methods to the view
  $ctrl.admit = admit;

  function refreshVisitFeed() {
    if (!$ctrl.patientUuid) { return 0; }

    $ctrl.loaded = false;

    return Patients.Visits.read($ctrl.patientUuid)
      .then(visits => {
        visits.forEach(calculateDays);
        [mostRecentVisit] = visits;

        if (mostRecentVisit) {
          $ctrl.visiting = Boolean(mostRecentVisit.is_open);
        }

        $ctrl.visits = visits;
        $ctrl.loaded = true;
      });
  }

  function calculateDays(visit) {
    const startDate = new Moment(visit.start_date);
    const endDate = new Moment(visit.end_date);
    visit.totalDays = endDate.diff(startDate, 'days');
  }

  function admit() {
    const isAdmission = !$ctrl.visiting;
    Patients.Visits.openAdmission($ctrl.patientUuid, isAdmission, mostRecentVisit)
      .then(() => refreshVisitFeed())
      .catch(Notify.handleError);
  }
}

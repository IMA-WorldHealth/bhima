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
    $ctrl.viewLimit = DEFAULT_VISIT_LIMIT;
    $ctrl.loaded = false;
    $ctrl.loading = true;
    $ctrl.visiting = false;

    refreshVisitFeed();
  };

  // expose methods to the view
  $ctrl.admit = admit;

  function refreshVisitFeed() {
    $ctrl.loading = true;
    $ctrl.loaded = false;
    Patients.Visits.read($ctrl.patientUuid)
      .then((results) => {
        $ctrl.visits = results;
        $ctrl.visits.forEach(calculateDays);
        [mostRecentVisit] = $ctrl.visits;

        if (mostRecentVisit) {
          $ctrl.visiting = Boolean(mostRecentVisit.is_open);
        }

        $ctrl.loaded = true;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
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
      .then(() => {
        refreshVisitFeed();
      })
      .catch(Notify.handleError);
  }
}

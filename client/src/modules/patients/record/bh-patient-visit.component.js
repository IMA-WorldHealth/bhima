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
  var $ctrl = this;
  var mostRecentVisit;

  // Currently not limited on client to give accurate representation of total
  // number of visits
  var DEFAULT_VISIT_LIMIT = 3;

  this.$onInit = function $onInit() {
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
      .then(function (results) {
        $ctrl.visits = results;
        $ctrl.visits.forEach(calculateDays);
        mostRecentVisit = $ctrl.visits[0];

        if (mostRecentVisit) {
          $ctrl.visiting = Boolean(mostRecentVisit.is_open);
        }
        $ctrl.loaded = true;
      })
      .catch(Notify.handleError)
      .finally(function () {
        $ctrl.loading = false;
      });
  }

  function calculateDays(visit) {
    var startDate = new Moment(visit.start_date);
    var endDate = new Moment(visit.end_date);
    visit.totalDays = endDate.diff(startDate, 'days');
  }

  function admit() {
    var isAdmission = !$ctrl.visiting;
    Patients.Visits.openAdmission($ctrl.patientUuid, isAdmission, mostRecentVisit)
      .then(function (result) {
        refreshVisitFeed();
      })
      .catch(Notify.handleError);
  }
}

angular.module('bhima.components')
  .component('bhVisits', {
    bindings : {
      patientUuid : '<',
    },
    templateUrl : 'partials/templates/bhVisits.tmpl.html',
    controller  : VisitsController,
  });

VisitsController.$inject = ['PatientService', 'NotifyService', 'moment'];

function VisitsController(Patients, Notify, Moment) {
  var vm = this;
  var mostRecentVisit;

  // Currently not limited on client to give accurate representation of total
  // number of visits
  var DEFAULT_VISIT_LIMIT = 3;

  this.$onInit = function $onInit() {
    vm.viewLimit = DEFAULT_VISIT_LIMIT;
    vm.loaded = false;
    vm.loading = true;
    vm.visiting = false;

    refreshVisitFeed();
  };

  // expose methods to the view
  vm.admit = admit;

  function refreshVisitFeed() {
    vm.loading = true;
    vm.loaded = false;
    Patients.Visits.read(vm.patientUuid)
      .then(function (results) {
        vm.visits = results;
        vm.visits.forEach(calculateDays);
        mostRecentVisit = vm.visits[0];

        if (mostRecentVisit) {
          vm.visiting = Boolean(mostRecentVisit.is_open);
        }
        vm.loaded = true;
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  function calculateDays(visit) {
    var startDate = new Moment(visit.start_date);
    var endDate = new Moment(visit.end_date);
    visit.totalDays = endDate.diff(startDate, 'days');
  }

  function admit() {
    var isAdmission = !vm.visiting;
    Patients.Visits.openAdmission(vm.patientUuid, isAdmission, mostRecentVisit)
      .then(function (result) {
        refreshVisitFeed();
      })
      .catch(Notify.handleError);
  }
}

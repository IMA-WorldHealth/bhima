angular.module('bhima.controllers')
.controller('CheckInController', CheckInController);

CheckInController.$inject = ['$stateParams', 'moment', 'PatientService', 'NotifyService'];

function CheckInController($stateParams, moment, Patients, Notify) {
  var vm = this;
  var id = $stateParams.patientID;
  vm.id = id;

  // total number of visits to display in the 'Recent Visits' component
  var limitVisits = 3;
  vm.limitVisitDisplay = 3;

  // warn a user after x number of days
  /** @todo this number and logic should be defined as a global constant that drives all visit logic */
  var visitDurationWarnLimit = 5;

  vm.loaded = false;
  vm.checkingIn = false;
  vm.checkin = checkin;

  loadVisits();

  function loadVisits() {
    vm.outdatedVisit = false;
    vm.loaded = false;
    Patients.Visits.read(id, {limit : limitVisits})
      .then(function (visits) {
        vm.loaded = true;
        vm.visits = visits;

        // exit early if there are no patient visits
        if (!visits.length) {
          vm.outdatedVisit = true;
          return;
        }

        // check how long ago the most recent patient visit was
        vm.latestCheckIn = moment().diff(visits[0].start_date, 'days');

        // check to see if the latest visit was before the duration warn limit
        if (visitDurationWarnLimit - vm.latestCheckIn <= 0) {

          // limit the number of visible check ins given the warning text
          vm.limitVisitDisplay = 2;
          vm.outdatedVisit = true;
        }
      })
      .catch(Notify.handleError);
  }


  function checkin() {
    vm.checkingIn = true;
    Patients.Visits.checkin(id)
      .then(function (result) {
        Notify.success('PATIENT_RECORDS.CHECK_IN.SUCCESS');
        loadVisits();
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.checkingIn = false;
      });
  }
}

angular.module('bhima.components')
.component('bhVisits', {
  bindings : {
    patientUuid : '<'
  },
  templateUrl : 'partials/templates/bhVisits.tmpl.html',
  controller : VisitsController,
  controllerAs : '$ctrl'
});

VisitsController.$inject = ['PatientService', 'NotifyService'];

function VisitsController(Patients, Notify) {
  var vm = this;

  var DEFAULT_VISIT_LIMIT = 3;
  vm.loaded = false;
  vm.loading = true;


  vm.visiting = false;

  Patients.Visits.read(vm.patientUuid, { limit : DEFAULT_VISIT_LIMIT })
    .then(function (results) {
      vm.loaded = true;
      vm.visits = results;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });


  console.log(vm.patientUuid);
  console.log('controller fired');
}

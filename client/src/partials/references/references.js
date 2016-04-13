// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ReferenceController', ReferenceController);

ReferenceController.$inject = [
  'ReferenceService', 'ReferenceGroupService', 'SectionResultatService', '$window', '$translate'
];

function ReferenceController(referenceService, referenceGroupService, sectionResultatService, $window, $translate) {
  var vm = this;
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.del    = del;  

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load References groups
    referenceGroupService.read().then(function (data) {
      vm.referenceGroups = data;
    }).catch(handler);

    // load sections Resultats
    sectionResultatService.read().then(function (data) {
      vm.sectionResultats = data;
    }).catch(handler);

    // load Reference
    refreshReferences();
  }

  function cancel() {
    vm.view = 'default';
  }
  

  function create() {
    vm.view = 'create';
    vm.reference = {
      is_report : 0
    };    
  }

  // switch to update mode
  // data is an object that contains all the information of a Reference
  function update(data) {
    vm.view = 'update';
    vm.reference = data;
  }

  // refresh the displayed References
  function refreshReferences() {
    return referenceService.read(null,{ full : 1 }).then(function (data) {
      vm.references = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(form) {

     // if the form has errors, exit immediately
    if (form.$invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    var reference = angular.copy(vm.reference);
    
    promise = (creation) ?
      referenceService.create(reference) :
      referenceService.update(reference.id, reference);

    promise
      .then(function (response) {
        return refreshReferences();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  // switch to delete warning mode
  function del(reference) {
    var bool = $window.confirm($translate.instant('FORM.DIALOGS.CONFIRM_DELETE'));

     // if the user clicked cancel, reset the view and return
     if (!bool) {
        vm.view = 'default';
        return;
     }

    // if we get there, the user wants to delete a Reference
    vm.view = 'delete_confirm';
    referenceService.delete(reference.id)
    .then(function () {
       vm.view = 'delete_success';
       return refreshReferences();
    })
    .catch(function (error) {
      vm.HTTPError = error;
      vm.view = 'delete_error';
    });
  }

  startup();  
}
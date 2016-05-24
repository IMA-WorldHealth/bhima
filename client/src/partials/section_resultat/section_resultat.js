// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('sectionResultatController', sectionResultatController);

sectionResultatController.$inject = [
  'SectionResultatService', '$translate', 'ModalService', 'util'
];

function sectionResultatController(sectionResultatService, $translate, ModalService, util) {
  var vm = this;
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.del    = del;  

  vm.maxLength = util.maxTextLength;

  vm.doTranslate = doTranslate;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load sections resultats
    refreshSectionResultats();
  }

  function cancel() {
    vm.view = 'default';
  }
  

  function create() {
    vm.view = 'create';
    vm.sectionResultat = {};    
  }

  // switch to update mode
  // data is an object that contains all the information of a Section Resultat
  function update(data) {
    vm.view = 'update';
    vm.sectionResultat = data;
  }

  function doTranslate(key){
    return $translate.instant(key);
  }
  
  // refresh the displayed Sections Resultats
  function refreshSectionResultats() {
    return sectionResultatService.read(null,{ detailed : 1 }).then(function (data) {
      vm.sectionResultats = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(form) {
    
    // if the form has errors, exit immediately
    if (form.$invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    var sectionResultat = angular.copy(vm.sectionResultat);
    
    promise = (creation) ?
      sectionResultatService.create(sectionResultat) :
      sectionResultatService.update(sectionResultat.id, sectionResultat);

    promise
      .then(function (response) {
        return refreshSectionResultats();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  // switch to delete warning mode
  function del(sectionResultat) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool){
       // if the user clicked cancel, reset the view and return
       if (!bool) {
          vm.view = 'default';
          return;
       }

      // if we get there, the user wants to delete a Section Resultat
      vm.view = 'delete_confirm';
      sectionResultatService.delete(sectionResultat.id)
      .then(function () {
         vm.view = 'delete_success';
         return refreshSectionResultats();
      })
      .catch(function (error) {
        vm.HTTPError = error;
        vm.view = 'delete_error';
      });
    });  
  }

  startup();  
}

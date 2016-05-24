// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('sectionBilanController', sectionBilanController);

sectionBilanController.$inject = [
  'SectionBilanService', '$translate', 'ModalService', 'util'
];

function sectionBilanController(sectionBilanService, $translate, ModalService, util) {
  var vm = this;
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;
  vm.del    = del;  

  vm.doTranslate = doTranslate;
  vm.maxLength = util.maxTextLength;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load sections bilans
    refreshSectionBilans();
  }

  function cancel() {
    vm.view = 'default';
  }
  

  function create() {
    vm.view = 'create';
    vm.sectionBilan = {};    
  }

  // switch to update mode
  // data is an object that contains all the information of a Section Bilan
  function update(data) {
    vm.view = 'update';
    vm.sectionBilan = data;
  }

  function doTranslate(key){
    return $translate.instant(key);
  }
  
  // refresh the displayed Sections Bilans
  function refreshSectionBilans() {
    return sectionBilanService.read(null,{ detailed : 1 }).then(function (data) {
      vm.sectionBilans = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(form) {

     // stop submission if the form is invalid
    if (form.$invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    var sectionBilan = angular.copy(vm.sectionBilan);
    
    promise = (creation) ?
      sectionBilanService.create(sectionBilan) :
      sectionBilanService.update(sectionBilan.id, sectionBilan);

    promise
      .then(function (response) {
        return refreshSectionBilans();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  // switch to delete warning mode
  function del(sectionBilan) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool){
       // if the user clicked cancel, reset the view and return
      if (!bool) {
          vm.view = 'default';
          return;
      }

      // if we get there, the user wants to delete a Section Bilan
      vm.view = 'delete_confirm';
      sectionBilanService.delete(sectionBilan.id)
      .then(function () {
         vm.view = 'delete_success';
         return refreshSectionBilans();
      })
      .catch(function (error) {
        vm.HTTPError = error;
        vm.view = 'delete_error';
      });
    });  
  }

  startup();  
}
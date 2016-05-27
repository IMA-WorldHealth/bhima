// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ReferenceGroupController', ReferenceGroupController);

ReferenceGroupController.$inject = [
  'ReferenceGroupService', 'SectionBilanService', '$translate', 'ModalService', 'util'
];

function ReferenceGroupController(referenceGroupService, sectionBilanService, $translate, ModalService, util) {
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
  vm.referenceAbbrLength = util.length4;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load Section Bilans
    sectionBilanService.read().then(function (data) {
      vm.sectionBilans = data;
    }).catch(handler);

    // load Reference Group
    refreshReferenceGroups();
  }

  function cancel() {
    vm.view = 'default';
  }
  

  function create() {
    vm.view = 'create';
    vm.referenceGroup = {};    
  }

  // switch to update mode
  // data is an object that contains all the information of a Reference Group
  function update(data) {
    vm.view = 'update';
    vm.referenceGroup = data;
  }

  function doTranslate(key){
    return $translate.instant(key);
  }
  
  // refresh the displayed References groups
  function refreshReferenceGroups() {
    return referenceGroupService.read(null,{ detailed : 1 }).then(function (data) {
      vm.referenceGroups = data;
      vm.loading = false;
    });
  }

  // form submission
  function submit(form) {

    // if the form has errors, exit immediately
    if (form.$invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    var referenceGroup = angular.copy(vm.referenceGroup);
    
    promise = (creation) ?
      referenceGroupService.create(referenceGroup) :
      referenceGroupService.update(referenceGroup.id, referenceGroup);

    promise
      .then(function (response) {
        return refreshReferenceGroups();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  // switch to delete warning mode
  function del(referenceGroup) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool){
       // if the user clicked cancel, reset the view and return
      if (!bool) {
        vm.view = 'default';
        return;
      }

      // if we get there, the user wants to delete a Reference Group
      vm.view = 'delete_confirm';
      referenceGroupService.delete(referenceGroup.id)
      .then(function () {
        vm.view = 'delete_success';
        return refreshReferenceGroups();
      })
      .catch(function (error) {
        vm.HTTPError = error;
        vm.view = 'delete_error';
      });
    });  
  }

  startup();  
}
/** declaring the controller to the bhima module **/
angular.module('bhima.controllers')
.controller('patientGroupController', patientGroupController);

/** inject service(s) or dependencies for the modules **/
patientGroupController.$inject = ['PatientGroupService', 'PriceListService', 'SessionService', '$window'];

function patientGroupController (patientGroupService, priceListService, sessionService, $window){
  var vm = this; 

  /** This method is responsible of initializing data **/
  function startup (){

    /** make the loading state into true, while loading data **/
    vm.loading = true;

    /** fetching all price list **/
    priceListService.read()
    .then(function (priceLists){

      /** attaching the price list to the view **/
      vm.priceLists = priceLists;

      /** load all patient groups**/
      return loadPatientGroup();
    })
    .then(function (patientGroups){     

      vm.groups = patientGroups;

      /** turn loading to false, we all data **/
      vm.loading = false;
    });
  }

  /** this method is responsible to propose a GUI to user for creation **/
  function create (){

    /** init the patient group **/
    vm.patientGroup = {};

    /** swicth the view to create **/    
    vm.view = 'create';
  }

  /** this function is responsible of submiting the patient group to the server for creation **/
  function submit (invalid){

    /** if the form is not valid do nothing **/
    if(invalid) { return ; }
    
    var creation = (vm.view === 'create');
    var patientGroup = angular.copy(vm.patientGroup); 

    patientGroup.enterprise_id = sessionService.enterprise.id;

    var promise = (creation) ?
      patientGroupService.create(patientGroup) :
      patientGroupService.update(patientGroup.uuid, patientGroup);

    promise
      .then(function () {
        return loadPatientGroup();
      })
      .then(function (groups) {
        vm.selectedId = null;
        vm.groups = groups;
        vm.view = creation ? 'create' : 'update';
      })
      .catch(handler);
  }

  /** this function is handling error from $http server **/
  function handler (error){

    console.error(error);
  }

  /** this method is changing the view for the update **/
  function update (uuid){

    /** switch view to update **/
    vm.view = 'update';

    /** kepp id selected **/
    vm.selectedId = uuid;

    patientGroupService.read(uuid)
    .then(function (data) {
      vm.patientGroup = data;
    });
  }

  /** this function is responsible of removing a patient group **/
  function remove (){
    var confirm =
      $window.confirm('Are you sure you want to delete this patient group?');

    if (confirm) {
      patientGroupService.remove(vm.selectedId)
      .then(function (message) {
        vm.view = 'default';
        return loadPatientGroup();
      })
      .then(function (groups){
        vm.groups = groups;
      })
      .catch(handler);
    }
  }

  /** this method is load the full list of patient group **/
  function loadPatientGroup (){
    /** fetching the full list of patient group, and attach it to the view **/
      return patientGroupService.read(null, {params : {full : 1}});
  }

  /** call the first method to init data **/
  startup();

  /** exposing interfaces to the view **/
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.remove = remove;
}
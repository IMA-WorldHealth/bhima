// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ProjectController', ProjectController);

ProjectController.$inject = [
   'ProjectService', 'EnterpriseService', 'SnisService', 'FormStateFactory', '$translate', '$window'
];

function ProjectController(Projects, Enterprises, SnisService, StateFactory, $translate, $window) {
  var vm = this;

  vm.enterprises = [];
  vm.state = new StateFactory();
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.del = del;

  function handler(error) {
    console.error(error);
    vm.state.error();
  }

  // fired on startup
  function startup() {
    // load Projects
    refreshProjects();

    // load Enterprises
    Enterprises.read().then(function (data) {
      vm.enterprises = data;
    }).catch(handler);

    SnisService.healthZones().then(function (data) {
      data.forEach(function (l) {
        l.format = l.zone + ' - ' + l.territoire + ' (' + l.province + ')';
      });
      vm.zones = data;
    }).catch(handler);

    vm.state.reset();
  }

  function cancel() {
    vm.state.reset();
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.project = { locked : 0 };
  }

  // switch to update mode
  function update(data) {
    vm.state.reset();
    vm.project= data;
    vm.view = 'update';
  }

  // switch to delete warning mode
  function del(project) {
    var result = $window.confirm($translate.instant('FORM.DIALOGS.CONFIRM_DELETE'));
    if(result){
      vm.view = 'delete_confirm';
      Projects.delete(project.id)
      .then(function (response) {
        refreshProjects();
        vm.view = 'delete_success';
      }).catch(function (error) {
        vm.view = 'delete_error';
        vm.HTTPError = error;
      });
    } else {
      vm.view = 'default';
    } 
  }

  // refresh the displayed Projects
  function refreshProjects() {
    return Projects.read(null, { complete : 1 })
    .then(function (data) {
      vm.projects = data;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var project = angular.copy(vm.project);

    promise = (creation) ?
      Projects.create(project) :
      Projects.update(project.id, project);

    promise
      .then(function (response) {
        return refreshProjects();
      })
      .then(function () {
        update(project.id);
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();
}

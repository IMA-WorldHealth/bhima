// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('ProjectController', ProjectController);

ProjectController.$inject = [
   'ProjectService', 'EnterpriseService', 'SnisService', 'FormStateFactory'
];

function ProjectController(Projects, Enterprises, SnisService, StateFactory) {
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
    Projects.readComplete().then(function (data) {
      vm.projects = data;
    }).catch(handler);

    // load Enterprises
    Enterprises.read().then(function (data) {
      vm.enterprises = data;
    }).catch(handler);

    SnisService.readSnisZs().then(function (data) {
      data.forEach(function (l) {
        l.format = l.zone + ' - ' + l.territoire + ' (' + l.province + ')';
      });
      vm.snis_zs = data;
    }).catch(handler);

    vm.state.reset();
  }

  function cancel() {
    vm.state.reset();
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.project = {};
  }

  // Load a Project from the server
  function loadProject(data) {
    vm.project= data;      
  }

  // switch to update mode
  function update(id) {
    vm.state.reset();
    loadProject(id);
    vm.view = 'update';
  }

  // switch to delete warning mode
  function del(project) {
    vm.view = 'delete_confirm';
    Projects.del(project.id)
    .then(function (response) {
      refreshProjects();
      vm.view = 'delete_success';
    }).catch(function (error) {
      vm.view = 'delete_error';
      vm.HTTPError = error;
    })
  }

  // refresh the displayed Projects
  function refreshProjects() {
    return Projects.readComplete()
      .then(function (data) {
        vm.projects = data;
      });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }
    vm.project.locked = (vm.project.locked)?1:0;

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

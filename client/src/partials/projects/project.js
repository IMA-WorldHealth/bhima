angular.module('bhima.controllers')
.controller('ProjectController', ProjectController);

ProjectController.$inject = [
   'ProjectService', 'EnterpriseService', 'SnisService',
   'ModalService', 'util', 'NotifyService'
];

function ProjectController(Projects, Enterprises, SnisService, ModalService, util, Notify) {
  var vm = this;

  // bind methods
  vm.create = create;
  vm.update = update;
  vm.cancel = cancel;
  vm.submit = submit;
  vm.remove = remove;

  vm.maxLength = util.maxTextLength;
  vm.length3 = 3;

  // fired on startup
  function startup() {
    vm.view = 'default';

    // load projects
    refreshProjects().catch(Notify.handleError);

    // load enterprises
    Enterprises.read()
      .then(function (enterprises) {
        vm.enterprises = enterprises;
      })
      .catch(Notify.handleError);

    SnisService.healthZones()
      .then(function (zones) {
        vm.zones = zones;
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.project = { locked : 0 };
  }

  // switch to update mode
  function update(data) {
    vm.view = 'update';
    vm.project = data;
  }

  // switch to delete warning mode
  function remove(id) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Projects.delete(id)
        .then(function () {
          Notify.success('FORM.INFO.DELETE_SUCCESS');
          return refreshProjects();
        })
        .catch(Notify.handleError);
    });
  }

  // refresh the displayed projects
  function refreshProjects() {
    return Projects.read(null, { complete : 1 })
      .then(function (projects) {
        vm.projects = projects;
      });
  }

  // form submission
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = (vm.view === 'create');
    var project = angular.copy(vm.project);

    promise = (creation) ?
      Projects.create(project) :
      Projects.update(project.id, project);

    return promise
      .then(function (response) {
        return refreshProjects();
      })
      .then(function () {
        update(project.id);
        Notify.success(creation ? 'FORM.INFO.CREATE_SUCCESS' : 'FORM.INFO.UPDATE_SUCCESS');
      })
      .catch(Notify.handleError);
  }

  startup();
}

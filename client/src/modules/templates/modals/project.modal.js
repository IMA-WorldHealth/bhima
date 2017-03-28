angular.module('bhima.controllers')
.controller('ProjectModalController', ProjectModalController);

// dependencies injections
ProjectModalController.$inject = [
  '$uibModalInstance', 'ProjectService', 'NotifyService', 'data'
];

function ProjectModalController(Instance, Projects, Notify, Data) {
  var vm = this;

  vm.project = {};
  vm.action  = Data.action; // action must be 'create' or 'edit'
  vm.enterprise = Data.enterprise; // the project enterprise
  vm.showLock = Data.action === 'edit' ? true : false;

  // expose to the view
  vm.submit = submit;
  vm.close  = Instance.close;

  /**
   * @function submitProject
   * @desc submit project data to the server for create or update
   * @param {object} form The project form instance
   */
  function submit(form) {
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return;
    }

    var promise;
    var creation = !vm.showLock; //if show lock is false, creation true
    var project = angular.copy(vm.project);

    // set enterprise
    project.enterprise_id = vm.enterprise.id;

    // set locked boolean required
    project.locked = project.locked ? true : false;

    promise = (creation) ?
      Projects.create(project) :
      Projects.update(project.id, project);

    return promise
    .then(function (response) {
      Instance.close(true);
    })
    .catch(Notify.handleError);
  }

  /** startup function */
  function startup() {
    if (Data.action === 'edit' && Data.identifier) {
      Projects.read(Data.identifier)
      .then(function (project) {
        vm.project = project;
      })
      .catch(Notify.handleError);
    }
  }

  // run
  startup();

}

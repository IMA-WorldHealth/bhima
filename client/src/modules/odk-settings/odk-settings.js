angular.module('bhima.controllers')
  .controller('ODKSettingsController', ODKSettingsController);

ODKSettingsController.$inject = [
  'ODKSettingsService', 'util', 'NotifyService', 'SessionService', '$state', '$q',
];

/**
 * ODK Settings Controller
 *
 * Provides configuration parameters for the link to ODK.
 */
function ODKSettingsController(
  ODKSettings, util, Notify, Session, $state, $q,
) {
  const vm = this;

  vm.enterprise = Session.enterprise;
  vm.settings = { };

  vm.loading = false;

  function refreshSettings() {
    const settingsPromise = ODKSettings.read()
      .then(settings => {
        vm.hasODKConfiguration = settings.length > 0;
        if (vm.hasODKConfiguration) {
          [vm.settings] = settings;
        }
      });

    const projectPromise = ODKSettings.getProjectSettings()
      .then(project => {
        vm.project = project;
      });

    const appUsersPromise = ODKSettings.getAppUsers()
      .then(appUsers => {
        vm.appUsers = appUsers;
      });

    vm.loading = true;
    $q.all([settingsPromise, projectPromise, appUsersPromise])
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  }

  // bind methods
  vm.submit = submit;
  vm.syncEnterprise = () => {
    vm.loading = true;
    ODKSettings.syncEnterprise()
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => refreshSettings())
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  };

  vm.syncAppUsers = () => {
    vm.loading = true;

    ODKSettings.syncAppUsers()
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => refreshSettings())
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  };

  vm.syncForms = () => {
    vm.loading = true;
    ODKSettings.syncForms()
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => refreshSettings())
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  };

  vm.syncSubmissions = () => {
    vm.loading = true;
    ODKSettings.syncSubmissions()
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => refreshSettings())
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  };

  // fired on startup
  function startup() {
    refreshSettings();
  }

  // form submission
  function submit(form) {
    vm.loading = true;
    if (form.$invalid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
      return 0;
    }

    // make sure only fresh data is sent to the server.
    if (form.$pristine) {
      Notify.warn('FORM.WARNINGS.NO_CHANGES');
      return 0;
    }

    const changes = angular.copy(vm.settings);

    return ODKSettings.create(changes)
      .then(() => Notify.success('FORM.INFO.UPDATE_SUCCESS'))
      .then(() => refreshSettings())
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });
  }

  startup();
}

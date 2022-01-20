angular.module('bhima.controllers')
  .controller('ODKSettingsController', ODKSettingsController);

ODKSettingsController.$inject = [
  'ODKSettingsService', 'util', 'NotifyService', 'SessionService', '$state',
];

/**
 * ODK Settings Controller
 *
 * Provides configuration parameters for the link to ODK.
 */
function ODKSettingsController(
  ODKSettings, util, Notify, Session, $state,
) {
  const vm = this;

  vm.enterprise = Session.enterprise;
  vm.settings = { };

  // bind methods
  vm.submit = submit;
  vm.syncEnterprise = () => {
    ODKSettings.syncEnterprise()
      .then(() => { $state.reload(); })
      .catch(Notify.handleError);
  };

  vm.syncUsers = () => {
    ODKSettings.syncUsers()
      .then(() => ODKSettings.syncAppUsers())
      .then(() => { $state.reload(); })
      .catch(Notify.handleError);
  };

  vm.syncDepots = () => {
    ODKSettings.syncDepots()
      .then(() => { $state.reload(); })
      .catch(Notify.handleError);
  };

  // fired on startup
  function startup() {
    ODKSettings.read()
      .then(settings => {
        if (settings.length > 0) {
          [vm.settings] = settings;
        }
      })
      .catch(Notify.handleError);

    vm.loading = true;

    ODKSettings.getProjectSettings()
      .then(project => {
        vm.project = project;
      })
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });

    ODKSettings.getAppUsers()
      .then(appUsers => {
        vm.appUsers = appUsers;
      })
      .catch(Notify.handleError)
      .finally(() => { vm.loading = false; });

    // ODKSettings.getUserSettings()
    //   .then(users => {
    //     vm.users = users;
    //   })
    //   .catch(Notify.handleError);
  }

  // form submission
  function submit(form) {
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
      .then(() => $state.reload()) // Should we just refresh the stock settings in the Session?
      .catch(Notify.handleError);
  }

  startup();
}

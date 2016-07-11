angular.module('bhima.controllers')
.controller('LoginController', LoginController);

LoginController.$inject = [
  'appcache', 'SessionService', 'LanguageService', 'ProjectService',
  'NotifyService'
];

/**
 * Login Controller
 *
 * The login controller powers the bhima login page.
 */
function LoginController(AppCache, Session, Languages, Projects, Notify) {
  var vm = this;

  // the is the same as the SettingsContoller
  var cache = AppCache('preferences');

  // tracks the number of login attempts made by this user to show a
  // "forgot password" message if too many requests are made
  var attempts = 0;
  var maxAttempts = 3;

  // contains the values from the login form
  vm.credentials = {};
  vm.login = login;
  vm.languageService = Languages;

  // displays a message if the user attempts more than maxCount
  // times to login and fails each time.
  vm.excessiveAttempts = false;

  Languages.read()
  .then(function (languages) {
    vm.languages = languages;
  });

  // load project dependencies
  Projects.read()
  .then(function (projects) {
    vm.projects = projects;

    /** @todo - proper error handling in case there are no projects */
    if (vm.projects.length) {
      loadStoredProject();
    }
  });

  // If the user has logged in previously, the project will
  // be stored in appcache.  We will load it up as the default
  // choice.  If the user has not logged in previously, we will
  // select the first project as default.
  function loadStoredProject() {
    var defaultProjectIndex = 0;

    // if the project was found in the cache, set it to the default project
    // otherwise, use the defaultProjectIndex to set the default project
    vm.credentials.project = (cache.project) ?
        cache.project.id :
        vm.projects[defaultProjectIndex].id;
  }

  // logs the user in, creates the user client session
  function login(form) {

    // if the form is not valid, do not generate an $http request
    if (form.$invalid) { return; }

    // use the session service to log the user in
    return Session.login(vm.credentials)
    .then(function (session) {
      cache.project = session.project;
    })
    .catch(function (response) {

      // if the user has tried too many times, display a fatal error working for
      // ten seconds.
      if (maxAttempts <= attempts++) {
        return Notify.danger('AUTH.TOO_MANY_TRYS');
      }

      // use growl-notifications to display an error at the top of the window
      Notify.danger(response.data.code);
    });
  }
}

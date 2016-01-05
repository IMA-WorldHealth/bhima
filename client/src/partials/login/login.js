angular.module('bhima.controllers')
.controller('LoginController', LoginController);

LoginController.$inject = [
  '$scope', '$translate', '$location', '$http', '$timeout', 'appcache', 'appstate', 'SessionService',
];

// The login conroller
function LoginController($scope, $translate, $location, $http, $timeout, Appcache, appstate, SessionService) {

  // this is the View-Model (angular style guide).
  var vm = this,
      cache = new Appcache('preferences');

  // contains the values from the login form
  vm.credentials = {};
  vm.error = false;
  vm.login = login;
  vm.setLanguage = setLanguage;

  // load language dependencies
  $http.get('/languages')
  .then(function (response) {
    vm.languages = response.data;
  });

  // load project dependencies
  $http.get('/projects')
  .then(function (response) {
    vm.projects = response.data;

    // TODO -- proper error handling in case there is no
    // projects
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

    cache.fetch('project')
    .then(function (project) {
      var projectCacheFound = project && project.id;

      if (projectCacheFound) {

        // Assign the cached project as default selection
        vm.credentials.project = project.id;
      } else {

        // Assign defaultProjectIndex for now
        vm.credentials.project = vm.projects[defaultProjectIndex].id;
      }
    });
  }

  // logs the user in, creates the user client session
  function login(invalid, credentials) {
    vm.error = false;

    // if the form is not valid, do not generate an
    // $http request
    if (invalid) { return; }

    // submit the credentials to the server
    $http.post('/login', credentials)
    .then(function (response) {

      // Yay!  We are authenticated.  Create the user session.
      SessionService.create(response.data.user, response.data.enterprise, response.data.project);

      // HACK to send this signal to ApplicationController
      $timeout(function () {
        appstate.set('login', true);
      });

      // navigate to the home page
      $location.url('/');
    })
    .catch(function (error) {

      // If the error is a string, we generated it.  Translate it an display to user
      if (typeof error.data === 'string' ) {
        vm.error = 'AUTH.' + error.data;

      // do not swallow unrecognized errors
      } else {
        throw error;
      }

      // suppress missing data errors when editting again
      $scope.LoginForm.$setPristine();
    });
  }

  // switches languages
  function setLanguage(lang) {
    $translate.use(lang.key);
    cache.put('language', { current: lang.key });
  }
}

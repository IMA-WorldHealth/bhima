angular.module('bhima.controllers')
.controller('LoginController', LoginController);

LoginController.$inject = [
  '$scope', '$location', '$http', '$timeout', 'appcache', 'appstate', 'SessionService', 'LanguageService'
];

// The login conroller
function LoginController($scope, $location, $http, $timeout, AppCache, appstate, Session, Languages) {

  // this is the View-Model (angular style guide).
  var vm = this;

  // the is the same as the SettingsContoller
  var cache = AppCache('preferences');

  // local variable count to 
  var count = 0;
  var maxCount = 3;

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

    // if the project was found in the cache, set it to the default project
    // otherwise, use the defaultProjectIndex to set the default project
    vm.credentials.project = (cache.project) ?
        cache.project.id :
        vm.projects[defaultProjectIndex].id;
  }

  // logs the user in, creates the user client session
  function login(invalid) {
    vm.httpError = false;

    // if the form is not valid, do not generate an
    // $http request
    if (invalid) { return; }

    var credentials = vm.credentials;

    // submit the credentials to the server
    $http.post('/login', credentials)
    .then(function (response) {

      // Yay!  We are authenticated.  Create the user session.
      Session.create(response.data.user, response.data.enterprise, response.data.project);

      cache.project = credentials.project.id;

      // HACK to send this signal to ApplicationController
      $timeout(function () {
        appstate.set('login', true);
      });

      // navigate to the home page
      $location.url('/');
    })
    .catch(function (response) {

      // bind the http error to the view
      vm.httpError = response.data;

      // augment the count and rebind the excessive attempts variable
      count++;
      vm.excessiveAttempts = (maxCount <= count);
    });
  }
}

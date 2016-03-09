angular.module('bhima.controllers')
.controller('settings', SettingsController);

SettingsController.$inject = [
  '$http', '$routeParams', '$location', 'LanguageService', 'SessionService'
];

function SettingsController($http, $routeParams, $location, Languages, Session) {
  var vm = this;

  // the url to return to (using the back button)
  vm.url = $routeParams.url || '';

  // load settings from services
  vm.settings = { language : Languages.key };

  /** bind the language service for use in the view */
  Languages.read()
  .then(function (languages) {
    vm.languages = languages;
  });

  vm.languageService = Languages;

  /** returns a user to the previous url */
  vm.back = back;

  function back() {
    $location.url(vm.url);
  }

  /** @todo Wrap logout call in a service */
  vm.logout = function logout() {
    $http.get('/logout')
      .then(function () {
        Session.destroy();
        $location.url('/login');
      });
  };
}

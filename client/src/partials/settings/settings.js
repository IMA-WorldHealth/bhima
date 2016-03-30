angular.module('bhima.controllers')
.controller('settings', SettingsController);

SettingsController.$inject = [
  '$http', '$routeParams', '$location', 'LanguageService', 'SessionService'
];

/**
 * Settings Page Controller
 *
 * The settings page allows a user to control the local application settings,
 * such as display language.
 */
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

  vm.logout = Session.logout;
}

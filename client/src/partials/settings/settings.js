angular.module('bhima.controllers')
.controller('settings', SettingsController);

SettingsController.$inject = [
  '$state', 'LanguageService', 'SessionService'
];

/**
 * Settings Page Controller
 *
 * The settings page allows a user to control the local application settings,
 * such as display language.
 *
 * @constructor
 */
function SettingsController($state, Languages, Session) {
  var vm = this;

  // the url to return to (using the back button)
  vm.previous = $state.params.previous;

  // load settings from services
  vm.settings = { language : Languages.key };

  // bind methods/services to the view
  vm.languageService = Languages;
  vm.logout = Session.logout;

  /** bind the language service for use in the view */
  Languages.read()
  .then(function (languages) {
    vm.languages = languages;
  });
}

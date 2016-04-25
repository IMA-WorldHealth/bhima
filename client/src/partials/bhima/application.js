angular.module('bhima.controllers')
.controller('ApplicationController', ApplicationController);

ApplicationController.$inject = [
  'AppCache', 'SessionService', 'LanguageService', '$state'
];

function ApplicationController(AppCache, Session, Languages, $state) {
  var vm = this;

  // load in the application cache
  var cache = AppCache('preferences');

  // Default sidebar state
  /** @todo Load sidebar state before angular is bootstrapped to remove 'flicker' */
  vm.sidebarExpanded = false;

  // set up the languages for the application, including default languages
  // the 'true' parameter forces refresh
  Languages.read(true);

  vm.isLoggedIn = function isLoggedIn() {
    return !!Session.user;
  };

  // toggle session settings
  if (vm.isLoggedIn()) {
    vm.sidebarExpanded = cache.sidebar && cache.sidebar.expanded;
    vm.projectName = Session.project.name;
  }

  /**
   * Application Structure methods
   */
  vm.toggleSidebar = function toggleSidebar() {
    if (vm.isLoggedIn()) {
      vm.sidebarExpanded = !vm.sidebarExpanded;
      cache.sidebar = { expanded : vm.sidebarExpanded };
    }
  };

  vm.settings = function settings() {
    $state.go('settings', { previous : $state.$current.name });
  };
}

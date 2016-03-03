angular.module('bhima.controllers')
.controller('settings', Settings);

Settings.$inject = [
  '$http','$routeParams','$translate','$location','AppCache',
  'tmhDynamicLocale','amMoment', 'SessionService', 'store'
];

function Settings($http, $routeParams, $translate, $location, AppCache, tmhDynamicLocale, amMoment, SessionService, Store) {
  var vm = this;

  // set up a new appcache namespace
  var cache = AppCache('preferences');

  // TODO issue discussing DB modelling of languages, quick suggestion (id, label, translateKey, localeKey)
  var languageStore = new Store({identifier : 'translateKey'});
  var languages = [{
    translateKey : 'en',
    localeKey : 'en-us',
    label : 'English'
  }, {
    translateKey : 'fr',
    localeKey : 'fr-be',
    label : 'French'
  }, {
    translateKey : 'ln',
    localeKey : 'fr-cd',
    label : 'Lingala'
  }];

  languageStore.setData(languages);

  vm.url = $routeParams.url || '';

  // load settings from the cache
  vm.settings = { language : cache.language };

  vm.updateLanguage = function updateLanuage(key) {
    var language = languageStore.get(key);

    $translate.use(language.translateKey);
    tmhDynamicLocale.set(language.localeKey);
    amMoment.changeLocale(language.translateKey);

    cache.language = language;

    console.log('Cache:', cache);
  };

  vm.back = function back() {
    $location.url(vm.url);
  };

  /** @todo Wrap logout call in a service */
  vm.logout = function logout() {
    $http.get('/logout')
      .then(function () {
        SessionService.destroy();
        $location.url('/login');
      });
  };
}
